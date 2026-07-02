"use client";

import {
  ArrowRight,
  Briefcase,
  CalendarBlank,
  CalendarPlus,
  ChartLineUp,
  Check,
  CurrencyEur,
  DownloadSimple,
  GearSix,
  House,
  MapPin,
  Phone,
  PencilSimple,
  Plus,
  Receipt,
  Trash,
  UploadSimple,
  Users,
  X
} from "@phosphor-icons/react";
import { ChangeEvent, FormEvent, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchServiceDeskData, isSupabaseConfigured, supabase, syncServiceDeskData, type SupabaseAppData } from "@/lib/supabase";
import styles from "./page.module.css";

type ServiceType = "Garten" | "Technik";
type JobStatus = "Anfrage" | "Geplant" | "Erledigt" | "Bezahlt";
type PaymentMethod = "Offen" | "Bar" | "Überweisung" | "PayPal";
type View = "dashboard" | "customers" | "jobs" | "finance" | "backup";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  service: ServiceType | "Beides";
  note: string;
  createdAt: string;
}

interface Job {
  id: string;
  customerId: string;
  title: string;
  service: ServiceType;
  date: string;
  time: string;
  price: number | null;
  durationMinutes: number | null;
  materialCost: number | null;
  paymentMethod: PaymentMethod;
  paidAt: string;
  note: string;
  status: JobStatus;
}

interface AppData {
  customers: Customer[];
  jobs: Job[];
}

const STORAGE_KEY = "servicedesk-v2";
const SAVINGS_GOAL = 10000;

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

const starterData: AppData = {
  customers: [
    { id: "customer-1", name: "Frau Schneider", phone: "0172 3456789", address: "Kaiserstr. 45, 52146 Würselen", service: "Garten", note: "Rasen mähen, Beetpflege, Unkraut entfernen.", createdAt: dateFromToday(-18) },
    { id: "customer-2", name: "Herr Meurer", phone: "0241 456789", address: "Jakobstr. 82, Aachen", service: "Technik", note: "Drucker und WLAN prüfen.", createdAt: dateFromToday(-11) },
    { id: "customer-3", name: "Frau Becker", phone: "02405 123456", address: "Bardenberg, Würselen", service: "Garten", note: "Hecke etwa alle sechs Wochen prüfen.", createdAt: dateFromToday(-7) },
    { id: "customer-4", name: "Herr Jansen", phone: "0176 23456789", address: "Laurensberg, Aachen", service: "Technik", note: "Bitte ohne Fachbegriffe erklären.", createdAt: dateFromToday(-2) }
  ],
  jobs: [
    { id: "job-1", customerId: "customer-1", title: "Gartenpflege", service: "Garten", date: dateFromToday(0), time: "08:30", price: 65, durationMinutes: null, materialCost: null, paymentMethod: "Offen", paidAt: "", note: "", status: "Geplant" },
    { id: "job-2", customerId: "customer-2", title: "Technische Hilfe", service: "Technik", date: dateFromToday(0), time: "11:00", price: 45, durationMinutes: null, materialCost: null, paymentMethod: "Offen", paidAt: "", note: "", status: "Geplant" },
    { id: "job-3", customerId: "customer-3", title: "Heckenschnitt", service: "Garten", date: dateFromToday(0), time: "14:30", price: 90, durationMinutes: null, materialCost: null, paymentMethod: "Offen", paidAt: "", note: "", status: "Geplant" },
    { id: "job-4", customerId: "customer-4", title: "Laptop einrichten", service: "Technik", date: dateFromToday(1), time: "16:30", price: null, durationMinutes: null, materialCost: null, paymentMethod: "Offen", paidAt: "", note: "Preis nach Aufwand eintragen.", status: "Anfrage" },
    { id: "job-5", customerId: "customer-1", title: "Rasenpflege", service: "Garten", date: dateFromToday(-5), time: "09:00", price: 70, durationMinutes: 90, materialCost: 6, paymentMethod: "Bar", paidAt: dateFromToday(-5), note: "", status: "Bezahlt" },
    { id: "job-6", customerId: "customer-2", title: "Drucker einrichten", service: "Technik", date: dateFromToday(-9), time: "13:00", price: 50, durationMinutes: 60, materialCost: 0, paymentMethod: "Überweisung", paidAt: dateFromToday(-8), note: "", status: "Bezahlt" },
    { id: "job-7", customerId: "customer-3", title: "Garten aufräumen", service: "Garten", date: dateFromToday(-12), time: "10:30", price: null, durationMinutes: 120, materialCost: 8, paymentMethod: "Offen", paidAt: "", note: "Endpreis noch eintragen.", status: "Erledigt" }
  ]
};

const viewTitles: Record<View, string> = {
  dashboard: "Guten Morgen, Lukas",
  customers: "Kunden",
  jobs: "Aufträge",
  finance: "Finanzen",
  backup: "Backup"
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "Kein Termin";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Datum prüfen";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" }).format(date);
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Dauer offen";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(",", ".").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "Offen" || value === "Bar" || value === "Überweisung" || value === "PayPal";
}

function isCurrentMonth(date: string) {
  if (!date) return false;
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) return false;
  const today = new Date();
  return value.getMonth() === today.getMonth() && value.getFullYear() === today.getFullYear();
}

function jobGross(job: Job) {
  return job.price ?? 0;
}

function jobMaterial(job: Job) {
  return job.materialCost ?? 0;
}

function jobNet(job: Job) {
  return Math.max(0, jobGross(job) - jobMaterial(job));
}

function customerTotalRevenue(jobs: Job[]) {
  return jobs.filter((job) => job.status === "Bezahlt").reduce((sum, job) => sum + jobGross(job), 0);
}

function jobMoneyDate(job: Job) {
  return job.date;
}

function moneyHistory(jobs: Job[]) {
  const paidJobs = jobs
    .filter((job) => job.status === "Bezahlt" && job.price !== null && jobMoneyDate(job))
    .sort((a, b) => jobMoneyDate(a).localeCompare(jobMoneyDate(b)));
  let total = 0;

  return paidJobs.map((job) => {
    total += jobGross(job);
    return {
      id: job.id,
      date: jobMoneyDate(job),
      label: formatDate(jobMoneyDate(job)),
      title: job.title,
      total
    };
  });
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function compactDate(date: string) {
  return date.replaceAll("-", "");
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

function addMinutesToTime(date: string, time: string, minutes: number) {
  const value = new Date(`${date}T${time || "09:00"}:00`);
  value.setMinutes(value.getMinutes() + minutes);
  const nextDate = `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, "0")}${String(value.getDate()).padStart(2, "0")}`;
  const nextTime = `${String(value.getHours()).padStart(2, "0")}${String(value.getMinutes()).padStart(2, "0")}00`;
  return `${nextDate}T${nextTime}`;
}

function calendarStamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function calendarEvent(job: Job, customer?: Customer) {
  const title = `ServiceDesk: ${job.title}`;
  const notes = [
    customer?.name,
    customer?.phone ? `Telefon: ${customer.phone}` : "",
    job.service ? `Bereich: ${job.service}` : "",
    job.price !== null ? `Preis: ${formatMoney(job.price)}` : "Preis offen",
    job.note || customer?.note || ""
  ].filter(Boolean).join("\\n");
  const duration = job.durationMinutes || 60;
  const start = job.time ? `${compactDate(job.date)}T${job.time.replace(":", "")}00` : compactDate(job.date);
  const end = job.time ? addMinutesToTime(job.date, job.time, duration) : compactDate(addDays(job.date, 1));

  return [
    "BEGIN:VEVENT",
    `UID:${job.id}@servicedesk.local`,
    `DTSTAMP:${calendarStamp()}`,
    `SUMMARY:${escapeCalendarText(title)}`,
    job.time ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${start}`,
    job.time ? `DTEND:${end}` : `DTEND;VALUE=DATE:${end}`,
    customer?.address ? `LOCATION:${escapeCalendarText(customer.address)}` : "",
    `DESCRIPTION:${escapeCalendarText(notes)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(`Erinnerung: ${job.title}`)}`,
    "END:VALARM",
    "END:VEVENT"
  ].filter(Boolean).join("\r\n");
}

function calendarFile(jobs: Job[], customers: Map<string, Customer>) {
  const events = jobs
    .filter((job) => job.date)
    .map((job) => calendarEvent(job, customers.get(job.customerId)));

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ServiceDesk//Lukas Hanzlick//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:ServiceDesk",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeData(parsed: Partial<AppData>): AppData {
  const customers = Array.isArray(parsed.customers) ? parsed.customers : [];
  const jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];

  return {
    customers: customers.map((customer, index) => ({
      id: typeof customer.id === "string" ? customer.id : crypto.randomUUID(),
      name: typeof customer.name === "string" ? customer.name : `Kunde ${index + 1}`,
      phone: typeof customer.phone === "string" ? customer.phone : "",
      address: typeof customer.address === "string" ? customer.address : "",
      service: customer.service === "Garten" || customer.service === "Technik" || customer.service === "Beides" ? customer.service : "Beides",
      note: typeof customer.note === "string" ? customer.note : "",
      createdAt: typeof customer.createdAt === "string" ? customer.createdAt : dateFromToday(0)
    })),
    jobs: jobs.map((job, index) => ({
      id: typeof job.id === "string" ? job.id : crypto.randomUUID(),
      customerId: typeof job.customerId === "string" ? job.customerId : "",
      title: typeof job.title === "string" ? job.title : `Auftrag ${index + 1}`,
      service: job.service === "Garten" || job.service === "Technik" ? job.service : "Technik",
      date: typeof job.date === "string" ? job.date : "",
      time: typeof job.time === "string" ? job.time : "",
      price: typeof job.price === "number" && Number.isFinite(job.price) ? job.price : null,
      durationMinutes: typeof job.durationMinutes === "number" && Number.isFinite(job.durationMinutes) ? job.durationMinutes : null,
      materialCost: typeof job.materialCost === "number" && Number.isFinite(job.materialCost) ? job.materialCost : null,
      paymentMethod: isValidPaymentMethod(job.paymentMethod) ? job.paymentMethod : "Offen",
      paidAt: typeof job.paidAt === "string" ? job.paidAt : "",
      note: typeof job.note === "string" ? job.note : "",
      status: job.status === "Anfrage" || job.status === "Geplant" || job.status === "Erledigt" || job.status === "Bezahlt" ? job.status : "Geplant"
    }))
  };
}

function syncErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `Sync-Fehler: ${error.message.slice(0, 48)}`;
  }

  return "Supabase nicht erreichbar";
}

export default function HomePage() {
  const [view, setView] = useState<View>("dashboard");
  const [data, setData] = useState<AppData>(starterData);
  const [loaded, setLoaded] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState("Noch kein Backup in dieser Sitzung.");
  const [isOffline, setIsOffline] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isSupabaseConfigured ? "Sync wird vorbereitet" : "Lokal gespeichert");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const applyingRemoteDataRef = useRef(false);
  const localDataRef = useRef<AppData>(starterData);
  const remoteLoadedForUserRef = useRef<string | null>(null);

  function applyRemoteData(remoteData: AppData) {
    const normalizedRemoteData = normalizeData(remoteData);
    const remoteSnapshot = JSON.stringify(normalizedRemoteData);
    const localSnapshot = JSON.stringify(localDataRef.current);

    if (remoteSnapshot === localSnapshot) return;

    applyingRemoteDataRef.current = true;
    setData(normalizedRemoteData);
    window.localStorage.setItem(STORAGE_KEY, remoteSnapshot);
    window.setTimeout(() => {
      applyingRemoteDataRef.current = false;
    }, 0);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    let localData = starterData;

    if (saved) {
      try {
        localData = normalizeData(JSON.parse(saved) as Partial<AppData>);
        setData(localData);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    localDataRef.current = localData;
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
      setAuthReady(true);
      setSyncStatus(sessionData.session ? "Verbinde mit Supabase" : "Bitte einloggen");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      setSyncStatus(nextSession ? "Verbinde mit Supabase" : "Bitte einloggen");
      if (!nextSession) remoteLoadedForUserRef.current = null;
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localDataRef.current = data;

    if (!isSupabaseConfigured || applyingRemoteDataRef.current) {
      if (!isSupabaseConfigured) setSyncStatus("Lokal gespeichert");
      return;
    }

    setSyncStatus("Sync läuft");
    if (!session) {
      setSyncStatus(authReady ? "Bitte einloggen" : "Login wird geprüft");
      return;
    }

    const timeout = window.setTimeout(() => {
      syncServiceDeskData(data as SupabaseAppData)
        .then(() => setSyncStatus("Mit Supabase synchronisiert"))
        .catch((error) => setSyncStatus(syncErrorMessage(error)));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [authReady, data, loaded, session]);

  useEffect(() => {
    if (!loaded || !authReady || !session) return;
    if (remoteLoadedForUserRef.current === session.user.id) return;

    remoteLoadedForUserRef.current = session.user.id;
    setSyncStatus("Verbinde mit Supabase");

    fetchServiceDeskData()
      .then((remoteData) => {
        if (!remoteData) return;
        const hasRemoteData = remoteData.customers.length > 0 || remoteData.jobs.length > 0;

        if (hasRemoteData) {
          applyRemoteData(remoteData);
        } else {
          return syncServiceDeskData(localDataRef.current as SupabaseAppData);
        }
      })
      .then(() => {
        setSyncStatus("Mit Supabase synchronisiert");
      })
      .catch((error) => {
        setSyncStatus(syncErrorMessage(error));
      });
  }, [authReady, loaded, session]);

  useEffect(() => {
    if (!loaded || !authReady || !session) return;

    let stopped = false;

    async function refreshFromSupabase() {
      if (stopped || applyingRemoteDataRef.current || document.hidden) return;

      try {
        const remoteData = await fetchServiceDeskData();
        if (!remoteData || stopped) return;
        applyRemoteData(remoteData);
      } catch (error) {
        setSyncStatus(syncErrorMessage(error));
      }
    }

    const interval = window.setInterval(refreshFromSupabase, 5000);

    function refreshWhenVisible() {
      if (!document.hidden) refreshFromSupabase();
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshFromSupabase);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshFromSupabase);
    };
  }, [authReady, loaded, session]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        setOfflineReady(true);
      }).catch(() => {
        // ServiceDesk works without offline cache; registration is just a bonus.
      });

      navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    function updateConnectionState() {
      setIsOffline(!navigator.onLine);
    }

    updateConnectionState();
    window.addEventListener("online", updateConnectionState);
    window.addEventListener("offline", updateConnectionState);

    return () => {
      window.removeEventListener("online", updateConnectionState);
      window.removeEventListener("offline", updateConnectionState);
    };
  }, []);

  const customerMap = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers]
  );
  const sortedJobs = useMemo(
    () => [...data.jobs].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [data.jobs]
  );
  const upcomingJobs = sortedJobs.filter((job) => job.status !== "Bezahlt" && job.date && job.date >= dateFromToday(0));
  const openJobs = data.jobs.filter((job) => job.status !== "Bezahlt").length;
  const monthJobs = data.jobs.filter((job) => isCurrentMonth(jobMoneyDate(job)));
  const paidMonthJobs = monthJobs.filter((job) => job.status === "Bezahlt" && job.price !== null);
  const doneWithoutPrice = data.jobs.filter((job) => job.status === "Erledigt" && job.price === null).length;
  const newCustomersThisMonth = data.customers.filter((customer) => isCurrentMonth(customer.createdAt)).length;
  const monthRevenue = paidMonthJobs.reduce((sum, job) => sum + jobGross(job), 0);
  const monthMaterial = paidMonthJobs.reduce((sum, job) => sum + jobMaterial(job), 0);
  const monthProfit = paidMonthJobs.reduce((sum, job) => sum + jobNet(job), 0);
  const totalRevenue = data.jobs.filter((job) => job.status === "Bezahlt").reduce((sum, job) => sum + jobGross(job), 0);
  const totalMoneyHistory = moneyHistory(data.jobs);
  const outstandingRevenue = data.jobs.filter((job) => job.status === "Erledigt").reduce((sum, job) => sum + jobGross(job), 0);
  const averageOrder = paidMonthJobs.length ? monthRevenue / paidMonthJobs.length : 0;
  const todayJobs = upcomingJobs.filter((job) => job.date === dateFromToday(0));
  const nextJob = upcomingJobs[0];
  const nextCustomer = nextJob ? customerMap.get(nextJob.customerId) : undefined;
  const selectedCustomer = selectedCustomerId ? customerMap.get(selectedCustomerId) : data.customers[0];
  const selectedCustomerJobs = selectedCustomer
    ? [...data.jobs]
      .filter((job) => job.customerId === selectedCustomer.id)
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
    : [];
  const todayLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  function addCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer: Customer = {
      id: crypto.randomUUID(),
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      service: String(form.get("service")) as Customer["service"],
      note: String(form.get("note")),
      createdAt: dateFromToday(0)
    };
    setData((current) => ({ ...current, customers: [customer, ...current.customers] }));
    setShowCustomerForm(false);
  }

  function addJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const job: Job = {
      id: crypto.randomUUID(),
      customerId: String(form.get("customerId")),
      title: String(form.get("title")),
      service: String(form.get("service")) as ServiceType,
      date: String(form.get("date")),
      time: String(form.get("time")),
      price: optionalNumber(form.get("price")),
      durationMinutes: null,
      materialCost: null,
      paymentMethod: "Bar",
      paidAt: "",
      note: String(form.get("note")),
      status: "Geplant"
    };
    setData((current) => ({ ...current, jobs: [job, ...current.jobs] }));
    setShowJobForm(false);
  }

  function updateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingJob) return;
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status")) as JobStatus;
    const updatedJob: Job = {
      ...editingJob,
      customerId: String(form.get("customerId")),
      title: String(form.get("title")),
      service: String(form.get("service")) as ServiceType,
      date: String(form.get("date")),
      time: String(form.get("time")),
      price: optionalNumber(form.get("price")),
      durationMinutes: optionalNumber(form.get("durationMinutes")),
      materialCost: optionalNumber(form.get("materialCost")),
      paymentMethod: "Bar",
      paidAt: status === "Bezahlt" ? editingJob.paidAt || editingJob.date || dateFromToday(0) : "",
      note: String(form.get("note")),
      status
    };
    setData((current) => ({
      ...current,
      jobs: current.jobs.map((job) => job.id === updatedJob.id ? updatedJob : job)
    }));
    setEditingJob(null);
  }

  function deleteJob(jobId: string) {
    setData((current) => ({
      ...current,
      jobs: current.jobs.filter((job) => job.id !== jobId)
    }));
    setEditingJob(null);
  }

  function updateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCustomer) return;
    const form = new FormData(event.currentTarget);
    const updatedCustomer: Customer = {
      ...editingCustomer,
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      service: String(form.get("service")) as Customer["service"],
      note: String(form.get("note"))
    };
    setData((current) => ({
      ...current,
      customers: current.customers.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    }));
    setEditingCustomer(null);
  }

  function deleteCustomer(customerId: string) {
    setData((current) => ({
      customers: current.customers.filter((customer) => customer.id !== customerId),
      jobs: current.jobs.filter((job) => job.customerId !== customerId)
    }));
    setEditingCustomer(null);
  }

  function advanceStatus(jobId: string) {
    const nextStatus: Record<JobStatus, JobStatus> = {
      Anfrage: "Geplant",
      Geplant: "Erledigt",
      Erledigt: "Bezahlt",
      Bezahlt: "Bezahlt"
    };
    setData((current) => ({
      ...current,
      jobs: current.jobs.map((job) => {
        if (job.id !== jobId) return job;
        const status = nextStatus[job.status];
        return {
          ...job,
          status,
          paidAt: status === "Bezahlt" ? job.paidAt || job.date || dateFromToday(0) : job.paidAt,
          paymentMethod: status === "Bezahlt" ? "Bar" : job.paymentMethod
        };
      })
    }));
  }

  function exportBackup() {
    const backup = {
      app: "ServiceDesk",
      version: 2,
      exportedAt: new Date().toISOString(),
      data
    };
    downloadFile(
      `servicedesk-backup-${dateFromToday(0)}.json`,
      JSON.stringify(backup, null, 2),
      "application/json"
    );
    setBackupStatus("Backup wurde als JSON-Datei heruntergeladen.");
  }

  function exportCalendarJobs(jobsToExport: Job[]) {
    const datedJobs = jobsToExport.filter((job) => job.date);
    if (!datedJobs.length) {
      setBackupStatus("Keine Termine mit Datum für den Kalender gefunden.");
      return;
    }

    downloadFile(
      `servicedesk-termine-${dateFromToday(0)}.ics`,
      calendarFile(datedJobs, customerMap),
      "text/calendar;charset=utf-8"
    );
    setBackupStatus(`${datedJobs.length} Termine für Apple Kalender exportiert.`);
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData> & { data?: Partial<AppData> };
      const imported: Partial<AppData> = parsed.data ?? parsed;
      const nextData = normalizeData(imported);

      if (!nextData.customers.length && !nextData.jobs.length) {
        setBackupStatus("Die Datei enthält keine ServiceDesk-Daten.");
        return;
      }

      setData(nextData);
      setBackupStatus(`Importiert: ${nextData.customers.length} Kunden und ${nextData.jobs.length} Aufträge.`);
    } catch {
      setBackupStatus("Import fehlgeschlagen. Bitte eine gültige ServiceDesk-JSON-Datei wählen.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    setAuthBusy(true);
    setAuthError("");

    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setAuthBusy(false);

    if (result.error) {
      setAuthError(result.error.message);
      return;
    }

    setSyncStatus("Verbinde mit Supabase");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSyncStatus("Bitte einloggen");
  }

  if (isSupabaseConfigured && !authReady) {
    return (
      <main className={styles.authShell}>
        <section className={styles.authCard}>
          <span className={styles.overline}>ServiceDesk</span>
          <h1>Login wird geprüft</h1>
          <p>Wir schauen kurz, ob du schon angemeldet bist.</p>
        </section>
      </main>
    );
  }

  if (isSupabaseConfigured && !session) {
    return (
      <main className={styles.authShell}>
        <section className={styles.authCard}>
          <span className={styles.overline}>ServiceDesk</span>
          <h1>{authMode === "signup" ? "Account erstellen" : "Einloggen"}</h1>
          <p>Damit deine Kunden und Aufträge online geschützt bleiben, brauchst du einen Login.</p>
          <form className={styles.form} onSubmit={handleAuth}>
            <label>E-Mail<input name="email" type="email" required autoFocus /></label>
            <label>Passwort<input name="password" type="password" required minLength={6} /></label>
            {authError && <p className={styles.authError}>{authError}</p>}
            <button className={styles.primaryButton} type="submit" disabled={authBusy}>
              {authBusy ? "Bitte warten" : authMode === "signup" ? "Account erstellen" : "Einloggen"}
            </button>
          </form>
          <button
            className={styles.authSwitch}
            type="button"
            onClick={() => {
              setAuthError("");
              setAuthMode(authMode === "signup" ? "login" : "signup");
            }}
          >
            {authMode === "signup" ? "Ich habe schon einen Account" : "Noch keinen Account? Erstellen"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <button className={styles.brand} onClick={() => setView("dashboard")} aria-label="ServiceDesk">S</button>
        <nav className={styles.navigation} aria-label="Hauptnavigation">
          <NavButton active={view === "dashboard"} icon={<House />} label="Übersicht" onClick={() => setView("dashboard")} />
          <NavButton active={view === "customers"} icon={<Users />} label="Kunden" onClick={() => setView("customers")} />
          <NavButton active={view === "jobs"} icon={<Briefcase />} label="Aufträge" onClick={() => setView("jobs")} />
          <NavButton active={view === "finance"} icon={<ChartLineUp />} label="Finanzen" onClick={() => setView("finance")} />
          <NavButton active={view === "backup"} icon={<GearSix />} label="Backup" onClick={() => setView("backup")} />
        </nav>
        <div className={styles.savedStatus}><Check weight="bold" /><span>{syncStatus}</span></div>
      </aside>

      <div className={`${styles.offlineStatus} ${isOffline ? styles.isOffline : ""}`}>
        <span />
        {isOffline ? "Offline: Änderungen bleiben auf diesem Gerät" : offlineReady ? "Offline bereit" : "Online"}
      </div>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <h1>{viewTitles[view]}</h1>
            <p>{view === "dashboard" ? todayLabel : "ServiceDesk"}</p>
          </div>
          <div className={styles.topActions}>
            {isSupabaseConfigured && (
              <button className={styles.textButton} onClick={signOut}>
                Abmelden
              </button>
            )}
            {(view === "dashboard" || view === "customers") && (
              <button className={styles.textButton} onClick={() => setShowCustomerForm(true)}>
                <Plus weight="bold" /> Neuer Kunde
              </button>
            )}
            <button className={styles.primaryButton} onClick={() => setShowJobForm(true)}>
              <Plus weight="bold" /> Neuer Auftrag
            </button>
          </div>
        </header>

        {view === "dashboard" && (
          <Dashboard
            todayJobs={todayJobs}
            upcomingJobs={upcomingJobs}
            openJobs={openJobs}
            monthRevenue={monthRevenue}
            totalRevenue={totalRevenue}
            totalMoneyHistory={totalMoneyHistory}
            newCustomersThisMonth={newCustomersThisMonth}
            doneWithoutPrice={doneWithoutPrice}
            customers={customerMap}
            nextJob={nextJob}
            nextCustomer={nextCustomer}
            onShowJobs={() => setView("jobs")}
            onShowFinance={() => setView("finance")}
            onOpenJob={setEditingJob}
          />
        )}

        {view === "customers" && (
          <section className={styles.pageSection}>
            <div className={styles.sectionHeader}><div><span>Kundenkartei</span><h2>{data.customers.length} Kontakte</h2></div></div>
            <div className={styles.customerWorkspace}>
              <div className={styles.customerList}>
                {data.customers.map((customer) => (
                  <article
                    className={`${styles.customerRow} ${selectedCustomer?.id === customer.id ? styles.selectedCustomerRow : ""}`}
                    key={customer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedCustomerId(customer.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedCustomerId(customer.id);
                      }
                    }}
                  >
                    <div className={styles.avatar}>{customer.name.charAt(0)}</div>
                    <div className={styles.customerIdentity}><strong>{customer.name}</strong><span>{customer.address}</span></div>
                    <span className={styles.muted}>{customer.service}</span>
                    <a href={`tel:${customer.phone}`} onClick={(event) => event.stopPropagation()}>{customer.phone}</a>
                    <span className={styles.customerNote}>{customer.note}</span>
                    <button className={styles.customerEditButton} onClick={(event) => { event.stopPropagation(); setEditingCustomer(customer); }} aria-label={`${customer.name} bearbeiten`}>
                      <PencilSimple />
                    </button>
                  </article>
                ))}
              </div>
              {selectedCustomer && (
                <CustomerProfile
                  customer={selectedCustomer}
                  jobs={selectedCustomerJobs}
                  onEdit={() => setEditingCustomer(selectedCustomer)}
                  onOpenJob={setEditingJob}
                />
              )}
            </div>
          </section>
        )}

        {view === "jobs" && (
          <section className={styles.pageSection}>
            <div className={styles.sectionHeader}><div><span>Auftragsliste</span><h2>{data.jobs.length} Aufträge</h2></div></div>
            <JobTable
              jobs={[...data.jobs].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))}
              customers={customerMap}
              onAdvance={advanceStatus}
              onEdit={setEditingJob}
              showPrice
            />
          </section>
        )}

        {view === "finance" && (
          <FinanceDashboard
            jobs={data.jobs}
            customers={customerMap}
            monthRevenue={monthRevenue}
            monthMaterial={monthMaterial}
            monthProfit={monthProfit}
            outstandingRevenue={outstandingRevenue}
            averageOrder={averageOrder}
            paidCount={paidMonthJobs.length}
            doneWithoutPrice={doneWithoutPrice}
            totalRevenue={totalRevenue}
            onOpenJobs={() => setView("jobs")}
          />
        )}

        {view === "backup" && (
          <BackupDashboard
            customersCount={data.customers.length}
            jobsCount={data.jobs.length}
            backupStatus={backupStatus}
            importInputRef={importInputRef}
            onExport={exportBackup}
            onExportCalendar={() => exportCalendarJobs(upcomingJobs)}
            onImport={importBackup}
          />
        )}
      </section>

      {showCustomerForm && (
        <Modal title="Neuen Kunden anlegen" onClose={() => setShowCustomerForm(false)}>
          <form className={styles.form} onSubmit={addCustomer}>
            <label>Name<input name="name" required autoFocus /></label>
            <label>Telefon<input name="phone" type="tel" required /></label>
            <label>Ort / Adresse<input name="address" required /></label>
            <label>Bereich<select name="service"><option>Garten</option><option>Technik</option><option>Beides</option></select></label>
            <label>Notiz<textarea name="note" rows={3} /></label>
            <button className={styles.primaryButton} type="submit">Kunden speichern</button>
          </form>
        </Modal>
      )}

      {showJobForm && (
        <Modal title="Neuen Auftrag eintragen" onClose={() => setShowJobForm(false)}>
          <form className={styles.form} onSubmit={addJob}>
            <label>Kunde<select name="customerId" required>{data.customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></label>
            <label>Leistung<input name="title" placeholder="z. B. Rasen mähen" required autoFocus /></label>
            <div className={styles.formColumns}>
              <label>Bereich<select name="service"><option>Garten</option><option>Technik</option></select></label>
              <label>Preis in Euro <small>optional, auch später möglich</small><input name="price" type="number" min="0" step="0.01" /></label>
            </div>
            <div className={styles.formColumns}>
              <label>Termin <small>optional bei Anfrage</small><input name="date" type="date" /></label>
              <label>Uhrzeit <small>optional</small><input name="time" type="time" /></label>
            </div>
            <label>Notiz <small>z. B. was vor Ort wichtig ist</small><textarea name="note" rows={2} /></label>
            <button className={styles.primaryButton} type="submit">Auftrag speichern</button>
          </form>
        </Modal>
      )}

      {editingJob && (
        <JobEditor
          job={editingJob}
          customers={data.customers}
          onExportCalendar={() => exportCalendarJobs([editingJob])}
          onSubmit={updateJob}
          onDelete={deleteJob}
          onClose={() => setEditingJob(null)}
        />
      )}

      {editingCustomer && (
        <CustomerEditor
          customer={editingCustomer}
          onSubmit={updateCustomer}
          onDelete={deleteCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </main>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? styles.active : ""} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function Dashboard({
  todayJobs,
  upcomingJobs,
  openJobs,
  monthRevenue,
  totalRevenue,
  totalMoneyHistory,
  newCustomersThisMonth,
  doneWithoutPrice,
  customers,
  nextJob,
  nextCustomer,
  onShowJobs,
  onShowFinance,
  onOpenJob
}: {
  todayJobs: Job[];
  upcomingJobs: Job[];
  openJobs: number;
  monthRevenue: number;
  totalRevenue: number;
  totalMoneyHistory: ReturnType<typeof moneyHistory>;
  newCustomersThisMonth: number;
  doneWithoutPrice: number;
  customers: Map<string, Customer>;
  nextJob?: Job;
  nextCustomer?: Customer;
  onShowJobs: () => void;
  onShowFinance: () => void;
  onOpenJob: (job: Job) => void;
}) {
  return (
    <>
      <div className={styles.dashboardFacts}>
        <span><CalendarBlank />{todayJobs.length} Termine heute</span>
        <span><Briefcase />{openJobs} Aufträge offen</span>
        <span><Users />{newCustomersThisMonth} neue Kunden</span>
        <span><CurrencyEur />{formatMoney(totalRevenue)} gesamt verdient</span>
        <button className={styles.factButton} onClick={onShowFinance}><CurrencyEur />{formatMoney(monthRevenue)} diesen Monat</button>
      </div>
      {doneWithoutPrice > 0 && (
        <button className={styles.notice} onClick={onShowJobs}>
          <Receipt /> {doneWithoutPrice} erledigte Aufträge brauchen noch einen Endpreis
        </button>
      )}
      <MoneyGrowthCard history={totalMoneyHistory} totalRevenue={totalRevenue} onShowFinance={onShowFinance} />
      <div className={styles.dashboardGrid}>
        <section className={styles.schedule}>
          <div className={styles.sectionHeader}><h2>Tagesplan</h2></div>
          <JobTable jobs={upcomingJobs.slice(0, 4)} customers={customers} compact onEdit={onOpenJob} />
          <button className={styles.inlineLink} onClick={onShowJobs}>Alle Termine <ArrowRight /></button>
        </section>
        <aside className={styles.nextAppointment}>
          <span className={styles.overline}>Nächster Termin</span>
          {nextJob && nextCustomer ? (
            <>
              <h2>{nextCustomer.name}</h2>
              <p className={styles.detailLine}><MapPin />{nextCustomer.address}</p>
              <a className={styles.detailLine} href={`tel:${nextCustomer.phone}`}><Phone />{nextCustomer.phone}</a>
              <p className={styles.appointmentNote}>{nextJob.note || nextCustomer.note || nextJob.title}</p>
              <a className={styles.inlineLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextCustomer.address)}`} target="_blank" rel="noreferrer">
                Route <ArrowRight />
              </a>
            </>
          ) : <p className={styles.muted}>Kein weiterer Termin geplant.</p>}
        </aside>
      </div>
    </>
  );
}

function MoneyGrowthCard({
  history,
  totalRevenue,
  onShowFinance
}: {
  history: ReturnType<typeof moneyHistory>;
  totalRevenue: number;
  onShowFinance: () => void;
}) {
  const width = 720;
  const height = 220;
  const paddingX = 28;
  const paddingY = 26;
  const maxValue = Math.max(...history.map((point) => point.total), totalRevenue, 1);
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const points = history.map((point, index) => {
    const x = paddingX + (history.length <= 1 ? chartWidth : (index / (history.length - 1)) * chartWidth);
    const y = height - paddingY - (point.total / maxValue) * chartHeight;
    return { ...point, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length
    ? `${linePath} L ${points.at(-1)?.x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";
  const latestPoint = points.at(-1);
  const firstPoint = points[0];
  const midValue = maxValue / 2;

  return (
    <section className={styles.moneyCard}>
      <div className={styles.moneyCardHeader}>
        <div>
          <span className={styles.overline}>Geldverlauf</span>
          <h2>Gesamt verdient steigt über Zeit</h2>
        </div>
        <div className={styles.moneyTotal}>
          <span>Gesamt</span>
          <strong>{formatMoney(totalRevenue)}</strong>
          <button className={styles.inlineLink} onClick={onShowFinance}>Finanzen ansehen <ArrowRight /></button>
        </div>
      </div>
      {points.length ? (
        <div className={styles.moneyChartWrap}>
          <svg className={styles.moneyChart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Gesamt verdient: ${formatMoney(totalRevenue)}`}>
            <defs>
              <linearGradient id="moneyArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line className={styles.moneyGridLine} x1={paddingX} x2={width - paddingX} y1={paddingY} y2={paddingY} />
            <line className={styles.moneyGridLine} x1={paddingX} x2={width - paddingX} y1={height / 2} y2={height / 2} />
            <line className={styles.moneyGridLine} x1={paddingX} x2={width - paddingX} y1={height - paddingY} y2={height - paddingY} />
            <text className={styles.moneyValueLabel} x={0} y={paddingY + 4}>{formatMoney(maxValue)}</text>
            <text className={styles.moneyValueLabel} x={0} y={height / 2 + 4}>{formatMoney(midValue)}</text>
            <text className={styles.moneyValueLabel} x={0} y={height - paddingY + 4}>0 €</text>
            {areaPath && <path className={styles.moneyArea} d={areaPath} />}
            {linePath && <path className={styles.moneyLine} d={linePath} />}
            {latestPoint && (
              <g>
                <circle className={styles.moneyDotHalo} cx={latestPoint.x} cy={latestPoint.y} r={8} />
                <circle className={styles.moneyDot} cx={latestPoint.x} cy={latestPoint.y} r={4} />
                <title>{`${latestPoint.label}: ${formatMoney(latestPoint.total)} gesamt`}</title>
              </g>
            )}
          </svg>
          <div className={styles.moneyAxis}>
            <span>{firstPoint?.label}</span>
            <span>{latestPoint?.label}</span>
          </div>
        </div>
      ) : (
        <div className={styles.moneyEmpty}>
          <CurrencyEur />
          <strong>Noch kein bezahlter Auftrag</strong>
          <span>Sobald du einen Auftrag auf „Bezahlt“ setzt, startet hier deine Geldkurve.</span>
        </div>
      )}
      {latestPoint && (
        <div className={styles.moneyFooter}>
          <span>Letzter Sprung</span>
          <strong>{latestPoint.title}</strong>
          <span>{latestPoint.label} · {formatMoney(latestPoint.total)} gesamt</span>
        </div>
      )}
    </section>
  );
}

function CustomerProfile({
  customer,
  jobs,
  onEdit,
  onOpenJob
}: {
  customer: Customer;
  jobs: Job[];
  onEdit: () => void;
  onOpenJob: (job: Job) => void;
}) {
  const paidJobs = jobs.filter((job) => job.status === "Bezahlt");
  const openJobs = jobs.filter((job) => job.status !== "Bezahlt");
  const totalRevenue = customerTotalRevenue(jobs);
  const lastJob = jobs[0];

  return (
    <aside className={styles.customerProfile}>
      <div className={styles.customerProfileHeader}>
        <div className={styles.profileAvatar}>{customer.name.charAt(0)}</div>
        <div>
          <span className={styles.overline}>Kundenprofil</span>
          <h2>{customer.name}</h2>
          <p>{customer.service} · seit {formatDate(customer.createdAt)}</p>
        </div>
        <button className={styles.customerEditButton} onClick={onEdit} aria-label={`${customer.name} bearbeiten`}>
          <PencilSimple />
        </button>
      </div>

      <div className={styles.profileActions}>
        <a href={`tel:${customer.phone}`}><Phone /> Anrufen</a>
        {customer.address && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`} target="_blank" rel="noreferrer">
            <MapPin /> Route
          </a>
        )}
      </div>

      <div className={styles.profileFacts}>
        <span><strong>{jobs.length}</strong> Aufträge</span>
        <span><strong>{formatMoney(totalRevenue)}</strong> Umsatz</span>
        <span><strong>{openJobs.length}</strong> offen</span>
      </div>

      <div className={styles.profileNote}>
        <span>Notiz</span>
        <p>{customer.note || "Noch keine Notiz. Hier kannst du dir merken, was der Kunde mag oder braucht."}</p>
      </div>

      <div className={styles.profileHistory}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Historie</span>
            <h2>{paidJobs.length} bezahlt</h2>
          </div>
        </div>
        {jobs.length === 0 && (
          <EmptyState
            icon={<Briefcase />}
            title="Noch keine Historie"
            text="Wenn du für diesen Kunden einen Auftrag einträgst, landet er hier automatisch."
          />
        )}
        {jobs.slice(0, 5).map((job) => (
          <button className={styles.historyItem} key={job.id} onClick={() => onOpenJob(job)}>
            <span>
              <strong>{job.title}</strong>
              <small>{formatDate(job.date)} · {job.status}</small>
            </span>
            <b>{job.price === null ? "offen" : formatMoney(job.price)}</b>
          </button>
        ))}
        {lastJob && <p className={styles.profileHint}>Letzter Kontakt: {formatDate(lastJob.date)} · {lastJob.title}</p>}
      </div>
    </aside>
  );
}

function BackupDashboard({
  customersCount,
  jobsCount,
  backupStatus,
  importInputRef,
  onExport,
  onExportCalendar,
  onImport
}: {
  customersCount: number;
  jobsCount: number;
  backupStatus: string;
  importInputRef: RefObject<HTMLInputElement>;
  onExport: () => void;
  onExportCalendar: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className={styles.pageSection}>
      <div className={styles.sectionHeader}>
        <div>
          <span>Sichern und mitnehmen</span>
          <h2>Deine Daten bleiben bei dir</h2>
        </div>
      </div>
      <div className={styles.backupGrid}>
        <article className={styles.backupCard}>
          <DownloadSimple />
          <span>Export</span>
          <h3>Backup herunterladen</h3>
          <p>Speichert Kunden, Aufträge, Preise und Notizen als JSON-Datei. Perfekt für Handy, USB-Stick oder Cloud.</p>
          <button className={styles.primaryButton} onClick={onExport}>Backup exportieren</button>
        </article>
        <article className={styles.backupCard}>
          <UploadSimple />
          <span>Import</span>
          <h3>Backup wiederherstellen</h3>
          <p>Wählt eine ServiceDesk-JSON-Datei aus und ersetzt die aktuellen Daten in diesem Browser.</p>
          <input ref={importInputRef} className={styles.hiddenInput} type="file" accept="application/json,.json" onChange={onImport} />
          <button className={styles.textButton} onClick={() => importInputRef.current?.click()}>JSON importieren</button>
        </article>
        <article className={styles.backupCard}>
          <CalendarPlus />
          <span>Apple Kalender</span>
          <h3>Termine exportieren</h3>
          <p>Erstellt eine .ics-Datei für alle offenen Termine. Am iPhone oder Mac öffnen und in Kalender übernehmen.</p>
          <button className={styles.primaryButton} onClick={onExportCalendar}>Apple Kalender exportieren</button>
        </article>
      </div>
      <div className={styles.backupMeta}>
        <span>{customersCount} Kunden</span>
        <span>{jobsCount} Aufträge</span>
        <span>{backupStatus}</span>
      </div>
    </section>
  );
}

function FinanceDashboard({
  jobs,
  customers,
  monthRevenue,
  monthMaterial,
  monthProfit,
  outstandingRevenue,
  averageOrder,
  paidCount,
  doneWithoutPrice,
  totalRevenue,
  onOpenJobs
}: {
  jobs: Job[];
  customers: Map<string, Customer>;
  monthRevenue: number;
  monthMaterial: number;
  monthProfit: number;
  outstandingRevenue: number;
  averageOrder: number;
  paidCount: number;
  doneWithoutPrice: number;
  totalRevenue: number;
  onOpenJobs: () => void;
}) {
  const financeJobs = [...jobs]
    .filter((job) => job.status === "Bezahlt" || job.status === "Erledigt")
    .sort((a, b) => jobMoneyDate(b).localeCompare(jobMoneyDate(a)));
  const gardenRevenue = financeJobs.filter((job) => job.status === "Bezahlt" && job.service === "Garten" && isCurrentMonth(jobMoneyDate(job))).reduce((sum, job) => sum + jobGross(job), 0);
  const techRevenue = financeJobs.filter((job) => job.status === "Bezahlt" && job.service === "Technik" && isCurrentMonth(jobMoneyDate(job))).reduce((sum, job) => sum + jobGross(job), 0);
  const goalPercent = Math.min(100, Math.round((totalRevenue / SAVINGS_GOAL) * 100));
  const goalLeft = Math.max(0, SAVINGS_GOAL - totalRevenue);

  return (
    <>
      <section className={styles.savingsCard}>
        <div>
          <span className={styles.overline}>USA-Auslandsjahr</span>
          <h2>{formatMoney(totalRevenue)} von {formatMoney(SAVINGS_GOAL)}</h2>
          <p>Noch {formatMoney(goalLeft)} bis zum Ziel. Jeder bezahlte Bar-Auftrag zählt automatisch dazu.</p>
        </div>
        <div className={styles.savingsProgress} aria-label={`${goalPercent} Prozent vom Sparziel erreicht`}>
          <span style={{ width: `${goalPercent}%` }} />
        </div>
        <strong>{goalPercent}%</strong>
      </section>
      <section className={styles.financeMetrics}>
        <article><span>Umsatz diesen Monat</span><strong>{formatMoney(monthRevenue)}</strong><small>{paidCount} bezahlte Aufträge</small></article>
        <article><span>Material / Kosten</span><strong>{formatMoney(monthMaterial)}</strong><small>von bezahlten Aufträgen</small></article>
        <article><span>Übrig grob</span><strong>{formatMoney(monthProfit)}</strong><small>Umsatz minus Material</small></article>
        <article><span>Noch offen</span><strong>{formatMoney(outstandingRevenue)}</strong><button onClick={onOpenJobs}>Zahlungen prüfen <ArrowRight /></button></article>
      </section>
      {doneWithoutPrice > 0 && (
        <button className={styles.notice} onClick={onOpenJobs}>
          <Receipt /> {doneWithoutPrice} erledigte Aufträge haben noch keinen Preis
        </button>
      )}
      <div className={styles.financeGrid}>
        <section className={styles.pageSection}>
          <div className={styles.sectionHeader}><div><span>Ein- und Ausgänge</span><h2>Letzte Zahlungen</h2></div></div>
          <JobTable jobs={financeJobs.slice(0, 7)} customers={customers} showPrice />
        </section>
        <aside className={styles.financeBreakdown}>
          <span className={styles.overline}>Umsatz nach Bereich</span>
          <div><span>Gartenservice</span><strong>{formatMoney(gardenRevenue)}</strong></div>
          <div><span>Technische Hilfe</span><strong>{formatMoney(techRevenue)}</strong></div>
          <div><span>Ø Auftrag</span><strong>{formatMoney(averageOrder)}</strong></div>
          <p>Die Werte basieren auf bezahlten Aufträgen. Material zählt als grobe Kosten, keine Steuerberatung.</p>
        </aside>
      </div>
    </>
  );
}

function JobTable({
  jobs,
  customers,
  onAdvance,
  onEdit,
  compact = false,
  showPrice = false
}: {
  jobs: Job[];
  customers: Map<string, Customer>;
  onAdvance?: (jobId: string) => void;
  onEdit?: (job: Job) => void;
  compact?: boolean;
  showPrice?: boolean;
}) {
  return (
    <div className={`${styles.jobTable} ${compact ? styles.compactTable : ""}`}>
      <div className={styles.tableHeader}><span>Zeit</span><span>Kunde</span><span>Leistung</span><span>{showPrice ? "Betrag" : "Status"}</span></div>
      {jobs.length === 0 && (
        <EmptyState
          icon={<CalendarBlank />}
          title="Alles ruhig"
          text="Hier erscheinen Termine und Aufträge, sobald du sie anlegst."
        />
      )}
      {jobs.map((job, index) => (
        <article
          className={`${styles.jobRow} ${index === 0 && compact ? styles.nextRow : ""} ${onEdit ? styles.clickableJobRow : ""}`}
          key={job.id}
          role={onEdit ? "button" : undefined}
          tabIndex={onEdit ? 0 : undefined}
          onClick={onEdit ? () => onEdit(job) : undefined}
          onKeyDown={onEdit ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onEdit(job);
            }
          } : undefined}
          aria-label={onEdit ? `${job.title} Details öffnen` : undefined}
        >
          <span className={styles.jobTime}>{compact ? job.time || "offen" : formatDate(job.date)}</span>
          <strong>{customers.get(job.customerId)?.name ?? "Unbekannter Kunde"}</strong>
          <span>{job.title}</span>
          {showPrice ? (
            <div className={styles.priceCell}>
              <div>
                <strong>{job.price === null ? "Preis offen" : formatMoney(job.price)}</strong>
                <small>{formatDuration(job.durationMinutes)}</small>
              </div>
              <div className={styles.rowActions}>
                {onAdvance && job.status !== "Bezahlt" && <button onClick={(event) => { event.stopPropagation(); onAdvance(job.id); }}>{job.status}</button>}
                {!onAdvance && <small>{job.status === "Bezahlt" ? "Bar vor Ort" : job.status}</small>}
                {onEdit && <button className={styles.editButton} onClick={(event) => { event.stopPropagation(); onEdit(job); }} aria-label={`${job.title} bearbeiten`}><PencilSimple /></button>}
              </div>
            </div>
          ) : <span className={styles.statusText}>{onEdit ? "Details" : job.status}</span>}
        </article>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className={styles.emptyState}>
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function JobEditor({
  job,
  customers,
  onExportCalendar,
  onSubmit,
  onDelete,
  onClose
}: {
  job: Job;
  customers: Customer[];
  onExportCalendar: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (jobId: string) => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const customer = customers.find((entry) => entry.id === job.customerId);

  return (
    <Modal title="Auftrag bearbeiten" onClose={onClose}>
      <div className={styles.jobDetailPanel}>
        <div>
          <span className={styles.overline}>Termin</span>
          <h3>{job.title}</h3>
          <p>{formatDate(job.date)}{job.time ? ` · ${job.time} Uhr` : ""} · {job.status}</p>
        </div>
        <div className={styles.detailGrid}>
          <span><strong>Kunde</strong>{customer?.name ?? "Unbekannter Kunde"}</span>
          <span><strong>Adresse</strong>{customer?.address || "Keine Adresse hinterlegt"}</span>
          <span><strong>Telefon</strong>{customer?.phone || "Keine Nummer hinterlegt"}</span>
          <span><strong>Dauer</strong>{formatDuration(job.durationMinutes)}</span>
          <span><strong>Preis</strong>{job.price === null ? "Preis offen" : formatMoney(job.price)}</span>
          <span><strong>Material</strong>{job.materialCost === null ? "Keine Kosten" : formatMoney(job.materialCost)}</span>
        </div>
        {(job.note || customer?.note) && (
          <p className={styles.detailNote}>{job.note || customer?.note}</p>
        )}
        {job.date && (
          <button className={styles.calendarButton} type="button" onClick={onExportCalendar}>
            <CalendarPlus /> In Apple Kalender
          </button>
        )}
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label>Kunde<select name="customerId" defaultValue={job.customerId} required>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></label>
        <label>Leistung<input name="title" defaultValue={job.title} required autoFocus /></label>
        <div className={styles.formColumns}>
          <label>Bereich<select name="service" defaultValue={job.service}><option>Garten</option><option>Technik</option></select></label>
          <label>Status<select name="status" defaultValue={job.status}><option>Anfrage</option><option>Geplant</option><option>Erledigt</option><option>Bezahlt</option></select></label>
        </div>
        <div className={styles.formColumns}>
          <label>Termin <small>optional</small><input name="date" type="date" defaultValue={job.date} /></label>
          <label>Uhrzeit <small>optional</small><input name="time" type="time" defaultValue={job.time} /></label>
        </div>
        <div className={styles.formColumns}>
          <label>Dauer in Minuten <small>nach dem Einsatz</small><input name="durationMinutes" type="number" min="0" step="5" defaultValue={job.durationMinutes ?? ""} placeholder="z. B. 90" /></label>
          <label>Material in Euro <small>optional</small><input name="materialCost" type="number" min="0" step="0.01" defaultValue={job.materialCost ?? ""} placeholder="0" /></label>
        </div>
        <div className={styles.formColumns}>
          <label>Endpreis in Euro <small>nach dem Termin</small><input name="price" type="number" min="0" step="0.01" defaultValue={job.price ?? ""} placeholder="Noch offen" /></label>
          <label>Zahlung <small>wird am Termin gezählt</small><input value="Bar vor Ort" readOnly /></label>
        </div>
        <label>Notiz<textarea name="note" rows={3} defaultValue={job.note} placeholder="Was wurde gemacht? Was fehlt noch?" /></label>
        <div className={styles.formFooter}>
          {!confirmDelete ? (
            <button className={styles.deleteButton} type="button" onClick={() => setConfirmDelete(true)}><Trash /> Löschen</button>
          ) : (
            <button className={styles.confirmDeleteButton} type="button" onClick={() => onDelete(job.id)}>Wirklich löschen</button>
          )}
          <button className={styles.primaryButton} type="submit">Änderungen speichern</button>
        </div>
      </form>
    </Modal>
  );
}

function CustomerEditor({
  customer,
  onSubmit,
  onDelete,
  onClose
}: {
  customer: Customer;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (customerId: string) => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Modal title="Kunde bearbeiten" onClose={onClose}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label>Name<input name="name" defaultValue={customer.name} required autoFocus /></label>
        <label>Telefon<input name="phone" type="tel" defaultValue={customer.phone} required /></label>
        <label>Ort / Adresse<input name="address" defaultValue={customer.address} required /></label>
        <label>Bereich<select name="service" defaultValue={customer.service}><option>Garten</option><option>Technik</option><option>Beides</option></select></label>
        <label>Notiz<textarea name="note" rows={3} defaultValue={customer.note} /></label>
        <div className={styles.formFooter}>
          {!confirmDelete ? (
            <button className={styles.deleteButton} type="button" onClick={() => setConfirmDelete(true)}><Trash /> Löschen</button>
          ) : (
            <button className={styles.confirmDeleteButton} type="button" onClick={() => onDelete(customer.id)}>Kunde und Aufträge löschen</button>
          )}
          <button className={styles.primaryButton} type="submit">Änderungen speichern</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header><h2>{title}</h2><button onClick={onClose} aria-label="Schließen"><X /></button></header>
        {children}
      </section>
    </div>
  );
}
