import { createClient } from "@supabase/supabase-js";

export type SupabaseServiceType = "Garten" | "Technik" | "Beides";
export type SupabaseJobService = "Garten" | "Technik";
export type SupabaseJobStatus = "Anfrage" | "Geplant" | "Erledigt" | "Bezahlt";
export type SupabasePaymentMethod = "Offen" | "Bar" | "Überweisung" | "PayPal";

export interface SupabaseCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  service: SupabaseServiceType;
  note: string;
  createdAt: string;
}

export interface SupabaseJob {
  id: string;
  customerId: string;
  title: string;
  service: SupabaseJobService;
  date: string;
  time: string;
  price: number | null;
  durationMinutes: number | null;
  materialCost: number | null;
  paymentMethod: SupabasePaymentMethod;
  paidAt: string;
  note: string;
  status: SupabaseJobStatus;
}

export interface SupabaseAppData {
  customers: SupabaseCustomer[];
  jobs: SupabaseJob[];
}

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  service: SupabaseServiceType;
  note: string;
  created_at: string;
};

type JobRow = {
  id: string;
  customer_id: string;
  title: string;
  service: SupabaseJobService;
  date: string;
  time: string;
  price: number | null;
  duration_minutes: number | null;
  material_cost: number | null;
  payment_method: SupabasePaymentMethod;
  paid_at: string;
  note: string;
  status: SupabaseJobStatus;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

function toCustomer(row: CustomerRow): SupabaseCustomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    service: row.service,
    note: row.note,
    createdAt: row.created_at
  };
}

function toCustomerRow(customer: SupabaseCustomer): CustomerRow {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    service: customer.service,
    note: customer.note,
    created_at: customer.createdAt
  };
}

function toJob(row: JobRow): SupabaseJob {
  return {
    id: row.id,
    customerId: row.customer_id,
    title: row.title,
    service: row.service,
    date: row.date,
    time: row.time,
    price: row.price,
    durationMinutes: row.duration_minutes,
    materialCost: row.material_cost,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
    note: row.note,
    status: row.status
  };
}

function toJobRow(job: SupabaseJob): JobRow {
  return {
    id: job.id,
    customer_id: job.customerId,
    title: job.title,
    service: job.service,
    date: job.date,
    time: job.time,
    price: job.price,
    duration_minutes: job.durationMinutes,
    material_cost: job.materialCost,
    payment_method: job.paymentMethod,
    paid_at: job.paidAt,
    note: job.note,
    status: job.status
  };
}

async function deleteRowsMissingLocally(table: "customers" | "jobs", idsToKeep: string[]) {
  if (!supabase) return;

  const { data, error } = await supabase.from(table).select("id");

  if (error) throw error;

  const keep = new Set(idsToKeep);
  const staleIds = (data ?? [])
    .map((row) => String(row.id))
    .filter((id) => !keep.has(id));

  if (!staleIds.length) return;

  const { error: deleteError } = await supabase.from(table).delete().in("id", staleIds);

  if (deleteError) throw deleteError;
}

export async function fetchServiceDeskData(): Promise<SupabaseAppData | null> {
  if (!supabase) return null;

  const [customersResult, jobsResult] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("jobs").select("*").order("date", { ascending: false })
  ]);

  if (customersResult.error) throw customersResult.error;
  if (jobsResult.error) throw jobsResult.error;

  return {
    customers: (customersResult.data ?? []).map((row) => toCustomer(row as CustomerRow)),
    jobs: (jobsResult.data ?? []).map((row) => toJob(row as JobRow))
  };
}

export async function deleteServiceDeskJob(jobId: string) {
  if (!supabase) return;

  const { data, error } = await supabase.from("jobs").delete().eq("id", jobId).select("id");

  if (error) throw error;
  if (!data?.length) throw new Error("Auftrag konnte online nicht gelöscht werden");
}

export async function deleteServiceDeskCustomer(customerId: string) {
  if (!supabase) return;

  const { error: jobsError } = await supabase.from("jobs").delete().eq("customer_id", customerId);
  if (jobsError) throw jobsError;

  const { data, error: customerError } = await supabase.from("customers").delete().eq("id", customerId).select("id");
  if (customerError) throw customerError;
  if (!data?.length) throw new Error("Kunde konnte online nicht gelöscht werden");
}

export async function syncServiceDeskData(data: SupabaseAppData) {
  if (!supabase) return;

  const customerRows = data.customers.map(toCustomerRow);
  const jobRows = data.jobs.map(toJobRow);
  const customerIds = data.customers.map((customer) => customer.id);
  const jobIds = data.jobs.map((job) => job.id);

  if (customerRows.length) {
    const { error } = await supabase.from("customers").upsert(customerRows, { onConflict: "id" });
    if (error) throw error;
  }

  if (jobRows.length) {
    const { error } = await supabase.from("jobs").upsert(jobRows, { onConflict: "id" });
    if (error) throw error;
  }

  await deleteRowsMissingLocally("jobs", jobIds);
  await deleteRowsMissingLocally("customers", customerIds);
}
