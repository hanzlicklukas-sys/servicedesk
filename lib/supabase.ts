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
  deleted_at?: string | null;
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
  deleted_at?: string | null;
};

type DeletedRecordRow = {
  record_type: "customer" | "job";
  record_id: string;
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

async function fetchDeletedRecords() {
  if (!supabase) return { customers: new Set<string>(), jobs: new Set<string>() };

  const { data, error } = await supabase
    .from("deleted_records")
    .select("record_type, record_id");

  if (error) throw error;

  const customers = new Set<string>();
  const jobs = new Set<string>();

  (data ?? []).forEach((row) => {
    const deleted = row as DeletedRecordRow;
    if (deleted.record_type === "customer") customers.add(deleted.record_id);
    if (deleted.record_type === "job") jobs.add(deleted.record_id);
  });

  return { customers, jobs };
}

async function markDeleted(recordType: "customer" | "job", recordId: string) {
  if (!supabase) return;

  const { error } = await supabase
    .from("deleted_records")
    .upsert(
      { record_type: recordType, record_id: recordId },
      { onConflict: "record_type,record_id" }
    );

  if (error) throw error;
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

  const [deleted, customersResult, jobsResult] = await Promise.all([
    fetchDeletedRecords(),
    supabase.from("customers").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
    supabase.from("jobs").select("*").is("deleted_at", null).order("date", { ascending: false })
  ]);

  if (customersResult.error) throw customersResult.error;
  if (jobsResult.error) throw jobsResult.error;

  return {
    customers: (customersResult.data ?? [])
      .map((row) => toCustomer(row as CustomerRow))
      .filter((customer) => !deleted.customers.has(customer.id)),
    jobs: (jobsResult.data ?? [])
      .map((row) => toJob(row as JobRow))
      .filter((job) => !deleted.jobs.has(job.id) && !deleted.customers.has(job.customerId))
  };
}

export async function deleteServiceDeskJob(jobId: string) {
  if (!supabase) return;

  await markDeleted("job", jobId);

  const { data, error } = await supabase
    .from("jobs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", jobId)
    .select("id");

  if (error) throw error;
  if (!data?.length) throw new Error("Auftrag wurde online nicht gefunden");
}

export async function deleteServiceDeskCustomer(customerId: string) {
  if (!supabase) return;

  const { data: relatedJobs, error: relatedJobsError } = await supabase
    .from("jobs")
    .select("id")
    .eq("customer_id", customerId);

  if (relatedJobsError) throw relatedJobsError;

  await Promise.all([
    markDeleted("customer", customerId),
    ...(relatedJobs ?? []).map((job) => markDeleted("job", String(job.id)))
  ]);

  const deletedAt = new Date().toISOString();

  const { error: jobsError } = await supabase
    .from("jobs")
    .update({ deleted_at: deletedAt })
    .eq("customer_id", customerId);
  if (jobsError) throw jobsError;

  const { data, error: customerError } = await supabase
    .from("customers")
    .update({ deleted_at: deletedAt })
    .eq("id", customerId)
    .select("id");
  if (customerError) throw customerError;
  if (!data?.length) throw new Error("Kunde wurde online nicht gefunden");
}

export async function saveServiceDeskCustomer(customer: SupabaseCustomer) {
  if (!supabase) return;

  const { error } = await supabase
    .from("customers")
    .upsert(toCustomerRow(customer), { onConflict: "id" });

  if (error) throw error;
}

export async function saveServiceDeskJob(job: SupabaseJob) {
  if (!supabase) return;

  const { error } = await supabase
    .from("jobs")
    .upsert(toJobRow(job), { onConflict: "id" });

  if (error) throw error;
}

export async function syncServiceDeskData(data: SupabaseAppData) {
  if (!supabase) return;

  const deleted = await fetchDeletedRecords();
  const visibleCustomers = data.customers.filter((customer) => !deleted.customers.has(customer.id));
  const visibleJobs = data.jobs.filter(
    (job) => !deleted.jobs.has(job.id) && !deleted.customers.has(job.customerId)
  );
  const customerRows = visibleCustomers.map(toCustomerRow);
  const jobRows = visibleJobs.map(toJobRow);
  const customerIds = visibleCustomers.map((customer) => customer.id);
  const jobIds = visibleJobs.map((job) => job.id);

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
