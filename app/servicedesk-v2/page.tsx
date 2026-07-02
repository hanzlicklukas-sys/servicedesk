"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArchiveIcon,
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  EuroIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LeafIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ServiceType = "Garten" | "Technik";
type JobStatus = "Anfrage" | "Geplant" | "Erledigt" | "Bezahlt";
type PaymentMethod = "Offen" | "Bar" | "Überweisung" | "PayPal";
type View = "overview" | "customers" | "jobs" | "finance" | "backup";

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

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

const fallbackData: AppData = {
  customers: [
    {
      id: "customer-1",
      name: "Frau Schneider",
      phone: "0172 3456789",
      address: "Kaiserstr. 45, 52146 Würselen",
      service: "Garten",
      note: "Rasen mähen, Beetpflege, Unkraut entfernen.",
      createdAt: dateFromToday(-18),
    },
    {
      id: "customer-2",
      name: "Herr Meurer",
      phone: "0241 456789",
      address: "Jakobstr. 82, Aachen",
      service: "Technik",
      note: "Drucker und WLAN prüfen.",
      createdAt: dateFromToday(-11),
    },
  ],
  jobs: [
    {
      id: "job-1",
      customerId: "customer-1",
      title: "Gartenpflege",
      service: "Garten",
      date: dateFromToday(0),
      time: "08:30",
      price: 65,
      durationMinutes: 90,
      materialCost: 0,
      paymentMethod: "Offen",
      paidAt: "",
      note: "",
      status: "Geplant",
    },
    {
      id: "job-2",
      customerId: "customer-2",
      title: "Technische Hilfe",
      service: "Technik",
      date: dateFromToday(1),
      time: "11:00",
      price: null,
      durationMinutes: null,
      materialCost: null,
      paymentMethod: "Offen",
      paidAt: "",
      note: "Preis nach Aufwand eintragen.",
      status: "Anfrage",
    },
  ],
};

const navItems: Array<{ id: View; label: string; icon: ReactNode }> = [
  { id: "overview", label: "Übersicht", icon: <LayoutDashboardIcon /> },
  { id: "customers", label: "Kunden", icon: <UsersIcon /> },
  { id: "jobs", label: "Aufträge", icon: <BriefcaseBusinessIcon /> },
  { id: "finance", label: "Finanzen", icon: <EuroIcon /> },
  { id: "backup", label: "Backup", icon: <ArchiveIcon /> },
];

const revenueChartConfig = {
  revenue: {
    label: "Umsatz",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const jobsChartConfig = {
  garten: {
    label: "Garten",
    color: "var(--chart-1)",
  },
  technik: {
    label: "Technik",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function normalizeData(value: Partial<AppData>): AppData {
  const customers = Array.isArray(value.customers) ? value.customers : [];
  const jobs = Array.isArray(value.jobs) ? value.jobs : [];

  return {
    customers: customers.map((customer, index) => ({
      id: typeof customer.id === "string" ? customer.id : `customer-${index}`,
      name: typeof customer.name === "string" ? customer.name : `Kunde ${index + 1}`,
      phone: typeof customer.phone === "string" ? customer.phone : "",
      address: typeof customer.address === "string" ? customer.address : "",
      service:
        customer.service === "Garten" ||
        customer.service === "Technik" ||
        customer.service === "Beides"
          ? customer.service
          : "Beides",
      note: typeof customer.note === "string" ? customer.note : "",
      createdAt: typeof customer.createdAt === "string" ? customer.createdAt : dateFromToday(0),
    })),
    jobs: jobs.map((job, index) => ({
      id: typeof job.id === "string" ? job.id : `job-${index}`,
      customerId: typeof job.customerId === "string" ? job.customerId : "",
      title: typeof job.title === "string" ? job.title : `Auftrag ${index + 1}`,
      service: job.service === "Garten" || job.service === "Technik" ? job.service : "Technik",
      date: typeof job.date === "string" ? job.date : "",
      time: typeof job.time === "string" ? job.time : "",
      price: typeof job.price === "number" && Number.isFinite(job.price) ? job.price : null,
      durationMinutes:
        typeof job.durationMinutes === "number" && Number.isFinite(job.durationMinutes)
          ? job.durationMinutes
          : null,
      materialCost:
        typeof job.materialCost === "number" && Number.isFinite(job.materialCost)
          ? job.materialCost
          : null,
      paymentMethod:
        job.paymentMethod === "Bar" ||
        job.paymentMethod === "Überweisung" ||
        job.paymentMethod === "PayPal"
          ? job.paymentMethod
          : "Offen",
      paidAt: typeof job.paidAt === "string" ? job.paidAt : "",
      note: typeof job.note === "string" ? job.note : "",
      status:
        job.status === "Anfrage" ||
        job.status === "Geplant" ||
        job.status === "Erledigt" ||
        job.status === "Bezahlt"
          ? job.status
          : "Geplant",
    })),
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string, mode: "short" | "weekday" = "short") {
  if (!value) return "Kein Termin";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Datum prüfen";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: mode === "weekday" ? "short" : "2-digit",
    weekday: mode === "weekday" ? "short" : undefined,
  }).format(date);
}

function isCurrentMonth(date: string) {
  if (!date) return false;
  const value = new Date(`${date}T12:00:00`);
  if (Number.isNaN(value.getTime())) return false;
  const today = new Date();
  return value.getMonth() === today.getMonth() && value.getFullYear() === today.getFullYear();
}

function statusVariant(status: JobStatus) {
  if (status === "Bezahlt") return "default";
  if (status === "Erledigt") return "secondary";
  return "outline";
}

function jobRevenueDate(job: Job) {
  return job.paidAt || job.date;
}

export default function ServiceDeskV2Page() {
  const [view, setView] = useState<View>("overview");
  const [data, setData] = useState<AppData>(fallbackData);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setData(normalizeData(JSON.parse(saved) as Partial<AppData>));
    } catch {
      setData(fallbackData);
    }
  }, []);

  const customerMap = useMemo(
    () => new Map(data.customers.map((customer) => [customer.id, customer])),
    [data.customers]
  );
  const sortedJobs = useMemo(
    () => [...data.jobs].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [data.jobs]
  );
  const upcomingJobs = sortedJobs.filter(
    (job) => job.status !== "Bezahlt" && job.date && job.date >= dateFromToday(0)
  );
  const paidMonthJobs = data.jobs.filter(
    (job) => job.status === "Bezahlt" && job.price !== null && isCurrentMonth(jobRevenueDate(job))
  );
  const monthRevenue = paidMonthJobs.reduce((sum, job) => sum + (job.price ?? 0), 0);
  const materialCost = paidMonthJobs.reduce((sum, job) => sum + (job.materialCost ?? 0), 0);
  const openRevenue = data.jobs
    .filter((job) => job.status === "Erledigt")
    .reduce((sum, job) => sum + (job.price ?? 0), 0);
  const todayJobs = upcomingJobs.filter((job) => job.date === dateFromToday(0));
  const pageTitle = navItems.find((item) => item.id === view)?.label ?? "Übersicht";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="h-14 justify-center border-b px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="font-semibold" isActive render={<button type="button" />}>
                <LeafIcon />
                <span>ServiceDesk</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={view === item.id}
                    onClick={() => setView(item.id)}
                    render={<button type="button" />}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <Button
            className="w-full justify-start"
            nativeButton={false}
            render={<a href="/" />}
            size="sm"
            variant="outline"
          >
            <HomeIcon data-icon="inline-start" />
            Altes Design
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden">
              <MenuIcon />
            </SidebarTrigger>
            <div>
              <p className="text-xs text-muted-foreground">ServiceDesk V2</p>
              <h1 className="font-semibold tracking-tight">{pageTitle}</h1>
            </div>
          </div>
          <Button nativeButton={false} render={<a href="/" />} size="sm" variant="outline">
            Bearbeiten
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          {view === "overview" && (
            <Overview
              customers={data.customers}
              customerMap={customerMap}
              jobs={data.jobs}
              materialCost={materialCost}
              monthRevenue={monthRevenue}
              openRevenue={openRevenue}
              paidMonthJobs={paidMonthJobs}
              todayJobs={todayJobs}
              upcomingJobs={upcomingJobs}
            />
          )}
          {view === "customers" && <Customers customers={data.customers} />}
          {view === "jobs" && <Jobs customerMap={customerMap} jobs={sortedJobs} />}
          {view === "finance" && (
            <Finance
              jobs={data.jobs}
              materialCost={materialCost}
              monthRevenue={monthRevenue}
              openRevenue={openRevenue}
              paidMonthJobs={paidMonthJobs}
            />
          )}
          {view === "backup" && <Backup customers={data.customers} jobs={data.jobs} />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Overview({
  customers,
  customerMap,
  jobs,
  materialCost,
  monthRevenue,
  openRevenue,
  paidMonthJobs,
  todayJobs,
  upcomingJobs,
}: {
  customers: Customer[];
  customerMap: Map<string, Customer>;
  jobs: Job[];
  materialCost: number;
  monthRevenue: number;
  openRevenue: number;
  paidMonthJobs: Job[];
  todayJobs: Job[];
  upcomingJobs: Job[];
}) {
  const openJobs = jobs.filter((job) => job.status !== "Bezahlt");
  const newCustomers = customers.filter((customer) => isCurrentMonth(customer.createdAt));

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border p-px md:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={<CalendarDaysIcon />} label="Heute" value={`${todayJobs.length} Termine`} footer="Tagesplan live aus deinen Daten" />
      <StatCard icon={<BriefcaseBusinessIcon />} label="Offen" value={`${openJobs.length} Aufträge`} footer={`${upcomingJobs.length} kommende Termine`} />
      <StatCard icon={<UserPlusIcon />} label="Neue Kunden" value={`${newCustomers.length}`} footer={`${customers.length} Kontakte gesamt`} />
      <StatCard icon={<EuroIcon />} label="Geld diesen Monat" value={formatMoney(monthRevenue)} footer={`${formatMoney(openRevenue)} noch offen`} />
      <RevenueChart jobs={paidMonthJobs} />
      <OpenJobsTable customerMap={customerMap} jobs={upcomingJobs.slice(0, 6)} />
      <FinanceHealth materialCost={materialCost} monthRevenue={monthRevenue} openRevenue={openRevenue} />
      <Activity jobs={jobs} customerMap={customerMap} />
    </div>
  );
}

function Customers({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border p-px lg:grid-cols-[1.4fr_1fr]">
      <DashboardCard className="gap-0 lg:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Kundenkartei</CardTitle>
          <CardDescription>Alle Kontakte als klare Tabelle, mit Service-Typ und Telefon.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableCaption className="sr-only">Gespeicherte Kunden im ServiceDesk.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-6">Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="pe-6 text-right">Telefon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow className="h-14" key={customer.id}>
                  <TableCell className="ps-6 font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.service}</Badge>
                  </TableCell>
                  <TableCell className="max-w-72 truncate text-muted-foreground">
                    {customer.address || "Keine Adresse"}
                  </TableCell>
                  <TableCell className="pe-6 text-right tabular-nums">
                    {customer.phone ? (
                      <a className="hover:underline" href={`tel:${customer.phone}`}>
                        {customer.phone}
                      </a>
                    ) : (
                      "Keine Nummer"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DashboardCard>
      {customers.slice(0, 4).map((customer) => (
        <DashboardCard key={customer.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">{customer.name}</CardTitle>
                <CardDescription>{customer.service}</CardDescription>
              </div>
              <Badge variant="outline">{customer.service}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <InfoLine icon={<MapPinIcon />} text={customer.address || "Keine Adresse"} />
            <InfoLine icon={<PhoneIcon />} text={customer.phone || "Keine Nummer"} />
            {customer.note ? <p className="text-muted-foreground">{customer.note}</p> : null}
          </CardContent>
        </DashboardCard>
      ))}
    </div>
  );
}

function Jobs({ customerMap, jobs }: { customerMap: Map<string, Customer>; jobs: Job[] }) {
  const gartenCount = jobs.filter((job) => job.service === "Garten").length;
  const technikCount = jobs.filter((job) => job.service === "Technik").length;

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border p-px lg:grid-cols-4">
      <StatCard icon={<LeafIcon />} label="Garten" value={`${gartenCount}`} footer="Aufträge" />
      <StatCard icon={<BriefcaseBusinessIcon />} label="Technik" value={`${technikCount}`} footer="Aufträge" />
      <StatCard icon={<ClockIcon />} label="Anfragen" value={`${jobs.filter((job) => job.status === "Anfrage").length}`} footer="Preis später eintragen" />
      <StatCard icon={<CheckCircle2Icon />} label="Erledigt" value={`${jobs.filter((job) => job.status === "Erledigt" || job.status === "Bezahlt").length}`} footer="inkl. bezahlt" />
      <JobsMixChart jobs={jobs} />
      <OpenJobsTable customerMap={customerMap} jobs={jobs} title="Alle Aufträge" />
    </div>
  );
}

function Finance({
  jobs,
  materialCost,
  monthRevenue,
  openRevenue,
  paidMonthJobs,
}: {
  jobs: Job[];
  materialCost: number;
  monthRevenue: number;
  openRevenue: number;
  paidMonthJobs: Job[];
}) {
  const paidJobs = jobs.filter((job) => job.status === "Bezahlt" && job.price !== null);
  const average = paidJobs.length ? monthRevenue / paidJobs.length : 0;

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border p-px md:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={<EuroIcon />} label="Umsatz" value={formatMoney(monthRevenue)} footer="dieser Monat" />
      <StatCard icon={<ArchiveIcon />} label="Material" value={formatMoney(materialCost)} footer="eingetragene Kosten" />
      <StatCard icon={<CheckCircle2Icon />} label="Ø Auftrag" value={formatMoney(average)} footer="bezahlte Jobs" />
      <StatCard icon={<ClockIcon />} label="Noch offen" value={formatMoney(openRevenue)} footer="erledigt, nicht bezahlt" />
      <RevenueChart jobs={paidMonthJobs} />
      <PaymentsTable jobs={jobs} />
      <FinanceHealth materialCost={materialCost} monthRevenue={monthRevenue} openRevenue={openRevenue} />
    </div>
  );
}

function Backup({ customers, jobs }: { customers: Customer[]; jobs: Job[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border p-px md:grid-cols-3">
      <StatCard icon={<UsersIcon />} label="Gesichert" value={`${customers.length}`} footer="Kunden im lokalen Speicher" />
      <StatCard icon={<BriefcaseBusinessIcon />} label="Gesichert" value={`${jobs.length}`} footer="Aufträge im lokalen Speicher" />
      <DashboardCard>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
          <CardDescription>Import und Export bleiben aktuell im stabilen alten Design.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<a href="/" />} variant="outline">
            <DownloadIcon data-icon="inline-start" />
            Backup öffnen
          </Button>
        </CardContent>
      </DashboardCard>
    </div>
  );
}

function StatCard({
  footer,
  icon,
  label,
  value,
}: {
  footer: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <DashboardCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-normal text-xs tracking-wide">{label}</CardTitle>
        <div className="text-muted-foreground [&_svg]:size-4">{icon}</div>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <p className="font-semibold text-2xl tabular-nums">{value}</p>
      </CardContent>
      <CardFooter className="rounded-none bg-background text-xs text-muted-foreground">{footer}</CardFooter>
    </DashboardCard>
  );
}

function RevenueChart({ jobs }: { jobs: Job[] }) {
  const rows = useMemo(() => buildRevenueRows(jobs), [jobs]);
  const first = rows[0]?.revenue ?? 0;
  const last = rows.at(-1)?.revenue ?? 0;
  const trend = first ? Math.round(((last - first) / first) * 100) : last ? 100 : 0;

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Umsatz Verlauf</CardTitle>
          <Badge variant={trend >= 0 ? "default" : "secondary"}>{trend >= 0 ? "+" : ""}{trend}%</Badge>
        </div>
        <CardDescription>Bezahlte Aufträge nach Tag, letzte 7 Tage.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-64 w-full md:h-80" config={revenueChartConfig}>
          <BarChart accessibilityLayer data={rows}>
            <XAxis
              axisLine={false}
              dataKey="label"
              interval={0}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}

function JobsMixChart({ jobs }: { jobs: Job[] }) {
  const rows = useMemo(() => buildJobMixRows(jobs), [jobs]);

  return (
    <DashboardCard className="gap-0 lg:col-span-2">
      <CardHeader>
        <CardTitle>Leistungen</CardTitle>
        <CardDescription>Garten und Technik nach Terminwoche.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-64 w-full md:h-80" config={jobsChartConfig}>
          <LineChart accessibilityLayer data={rows} margin={{ left: 12, right: 12, top: 8 }}>
            <CartesianGrid className="stroke-border" vertical={false} />
            <XAxis axisLine={false} dataKey="label" interval={0} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Line dataKey="garten" dot={false} stroke="var(--color-garten)" strokeWidth={2} type="step" />
            <Line dataKey="technik" dot={false} stroke="var(--color-technik)" strokeWidth={2} type="step" />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </DashboardCard>
  );
}

function OpenJobsTable({
  customerMap,
  jobs,
  title = "Nächste Aufträge",
}: {
  customerMap: Map<string, Customer>;
  jobs: Job[];
  title?: string;
}) {
  return (
    <DashboardCard className="relative gap-0 md:col-span-2">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>Termine, Status und Preise in einer kompakten Tabelle.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {jobs.length ? (
          <Table>
            <TableCaption className="sr-only">Aufträge mit Termin, Kunde, Leistung und Preis.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-6">Termin</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Leistung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pe-6 text-right">Preis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow className="h-12" key={job.id}>
                  <TableCell className="ps-6 font-medium tabular-nums">
                    {formatDate(job.date)} {job.time}
                  </TableCell>
                  <TableCell className="max-w-36 truncate">
                    {customerMap.get(job.customerId)?.name ?? "Unbekannt"}
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-muted-foreground">{job.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="pe-6 text-right tabular-nums">
                    {job.price === null ? "Offen" : formatMoney(job.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty className="min-h-64">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle2Icon />
              </EmptyMedia>
              <EmptyTitle>Alles frei.</EmptyTitle>
              <EmptyDescription>Keine passenden Aufträge vorhanden.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </DashboardCard>
  );
}

function PaymentsTable({ jobs }: { jobs: Job[] }) {
  const rows = jobs
    .filter((job) => job.price !== null)
    .sort((a, b) => jobRevenueDate(b).localeCompare(jobRevenueDate(a)))
    .slice(0, 6);

  return (
    <DashboardCard className="gap-0 md:col-span-2">
      <CardHeader className="border-b">
        <CardTitle>Zahlungen</CardTitle>
        <CardDescription>Die letzten eingetragenen Beträge und Zahlungsstatus.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableCaption className="sr-only">Zahlungen im ServiceDesk.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-6">Auftrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Methode</TableHead>
              <TableHead className="pe-6 text-right">Betrag</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((job) => (
              <TableRow className="h-12" key={job.id}>
                <TableCell className="max-w-44 truncate ps-6 font-medium">{job.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{job.paymentMethod}</TableCell>
                <TableCell className="pe-6 text-right tabular-nums">{formatMoney(job.price ?? 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </DashboardCard>
  );
}

function FinanceHealth({
  materialCost,
  monthRevenue,
  openRevenue,
}: {
  materialCost: number;
  monthRevenue: number;
  openRevenue: number;
}) {
  const profit = monthRevenue - materialCost;

  return (
    <DashboardCard className="gap-0">
      <CardHeader className="border-b">
        <CardTitle>Finanzsignal</CardTitle>
        <CardDescription>Ein schneller Check, ob Geld und Kosten passen.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FinanceLine label="Umsatz diesen Monat" value={formatMoney(monthRevenue)} />
        <FinanceLine label="Material / Kosten" value={formatMoney(materialCost)} />
        <FinanceLine label="Noch offen" value={formatMoney(openRevenue)} />
        <FinanceLine label="Grob übrig" value={formatMoney(profit)} />
      </CardContent>
    </DashboardCard>
  );
}

function Activity({ customerMap, jobs }: { customerMap: Map<string, Customer>; jobs: Job[] }) {
  const items = jobs
    .slice()
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5);

  return (
    <DashboardCard className="gap-0">
      <CardHeader className="border-b">
        <CardTitle>Aktivität</CardTitle>
        <CardDescription>Was zuletzt im ServiceDesk passiert ist.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="flex flex-col divide-y divide-border">
          {items.map((job) => (
            <li className="flex h-16 items-center gap-3 px-6" key={job.id}>
              <span className="flex size-10 shrink-0 items-center justify-center [&_svg]:size-4">
                {job.status === "Bezahlt" ? <EuroIcon /> : <ClockIcon />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm leading-snug">{job.title}</p>
                <p className="text-muted-foreground text-xs">
                  {customerMap.get(job.customerId)?.name ?? "Unbekannt"} · {formatDate(job.date, "weekday")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </DashboardCard>
  );
}

function FinanceLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <strong className="tabular-nums">{value}</strong>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}

function InfoLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="flex gap-2 text-muted-foreground [&_svg]:mt-0.5 [&_svg]:size-4">
      {icon}
      {text}
    </span>
  );
}

function buildRevenueRows(jobs: Job[]) {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = dateFromToday(index - 6);
    const revenue = jobs
      .filter((job) => jobRevenueDate(job) === date)
      .reduce((sum, job) => sum + (job.price ?? 0), 0);

    return {
      date,
      label: formatDate(date).slice(0, 5),
      revenue,
    };
  });
}

function buildJobMixRows(jobs: Job[]) {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = dateFromToday(index - 6);
    const dayJobs = jobs.filter((job) => job.date === date);

    return {
      date,
      label: formatDate(date).slice(0, 5),
      garten: dayJobs.filter((job) => job.service === "Garten").length,
      technik: dayJobs.filter((job) => job.service === "Technik").length,
    };
  });
}
