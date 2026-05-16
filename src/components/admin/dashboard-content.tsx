"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/src/lib/supabase/client"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import {
  Users, UserPlus, Stethoscope, BedDouble, UserCheck, CheckCircle2,
  CalendarCheck, CalendarClock, Activity, AlertCircle, PhoneCall,
  Clock, Euro, ShieldAlert, HeartPulse, Receipt, RefreshCw, ChevronRight, Check,
  ArrowUpRight, Heart, DoorOpen, BadgeEuro, Wallet, TrendingUp, Ambulance, Building2
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChartDay { date: string; label: string; total: number; completed: number; cancelled: number }
interface ChartMonth { label: string; revenue: number }

interface AdminStats {
  // users
  total_users: number; active_users: number; inactive_users: number
  doctors_count: number; nurses_count: number; reception_count: number
  // patients
  total_patients: number; new_patients_today: number
  hospitalized_patients: number; consultation_patients: number
  // appointments
  today_appointments: number; completed_appointments: number
  upcoming_appointments: number
  appointment_completion_rate: number; appointment_chart_data: ChartDay[]
  // beds & rooms
  total_beds: number; occupied_beds: number; available_beds: number
  bed_occupancy_rate: number; total_rooms: number
  // services
  total_services: number
  // billing
  paid_invoices: number; pending_invoices: number
  total_revenue: number; month_revenue: number
  payment_rate: number; revenue_chart_data: ChartMonth[]
  // ambulance
  ambulance_completed: number; ambulance_pending: number; ambulance_urgent: number
  // legacy
  total_doctors: number
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: string; color: string; trend?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-border bg-card shadow-sm card-hover-subtle group`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm font-medium text-muted-foreground mt-0.5 leading-snug">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, prefix = "" }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString("fr-FR") : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function DashboardContent({ stats: initialStats }: { stats: AdminStats }) {
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setLastRefresh(new Date())
      }
    } catch {
      // silent
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(refresh, 60_000)
    return () => clearInterval(timer)
  }, [refresh])

  // Real-time subscriptions
  useEffect(() => {
    const supabase = createClient()
    const tables = ["patients", "appointments", "hospitalizations", "invoices", "ambulance_requests", "beds", "profiles"]
    const channels = tables.map((table) =>
      supabase
        .channel(`realtime-${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => refresh())
        .subscribe()
    )
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)) }
  }, [refresh])

  const fmt = (n: number) => n.toLocaleString("fr-FR")
  const fmtCur = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "DZD", maximumFractionDigits: 0 }).format(n)

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  const usersPieData = [
    { name: "Médecins", value: stats.doctors_count },
    { name: "Infirmiers", value: stats.nurses_count },
    { name: "Réception", value: stats.reception_count },
    { name: "Autres", value: Math.max(0, stats.total_users - stats.doctors_count - stats.nurses_count - stats.reception_count) },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dernière mise à jour : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* ══ PATIENTS ══ */}
      <section>
        <SectionHeader icon={UserCheck} title="Patients" color="bg-blue-500/10 text-blue-600" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Patients" value={fmt(stats.total_patients)} color="bg-blue-500/10 text-blue-600" />
          <StatCard icon={UserPlus} label="Nouveaux aujourd'hui" value={fmt(stats.new_patients_today)} color="bg-cyan-500/10 text-cyan-600" />
          <StatCard icon={BedDouble} label="Hospitalisés" value={fmt(stats.hospitalized_patients)} color="bg-violet-500/10 text-violet-600" />
          <StatCard icon={Stethoscope} label="Consultation" value={fmt(stats.consultation_patients)} color="bg-emerald-500/10 text-emerald-600" />
        </div>
      </section>

      {/* ══ RENDEZ-VOUS ══ */}
      <section>
        <SectionHeader icon={CalendarCheck} title="Rendez-vous" color="bg-emerald-500/10 text-emerald-600" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <div className="col-span-2">
              <StatCard icon={CalendarCheck} label="Aujourd'hui" value={fmt(stats.today_appointments)} color="bg-blue-500/10 text-blue-600" />
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">Rendez-vous — 7 derniers jours</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.appointment_chart_data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#3b82f6" strokeWidth={2} fill="url(#gTotal)" dot={false} />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ══ HOSPITALISATION ══ */}
      <section>
        <SectionHeader icon={BedDouble} title="Hospitalisation & Lits" color="bg-violet-500/10 text-violet-600" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={BedDouble} label="Total Lits" value={fmt(stats.total_beds)} color="bg-slate-500/10 text-slate-600" />
          <StatCard icon={Heart} label="Lits Occupés" value={fmt(stats.occupied_beds)} color="bg-red-500/10 text-red-600" />
          <StatCard icon={CheckCircle2} label="Lits Disponibles" value={fmt(stats.available_beds)} color="bg-emerald-500/10 text-emerald-600" />
          <StatCard icon={DoorOpen} label="Chambres Actives" value={fmt(stats.total_rooms)} color="bg-blue-500/10 text-blue-600" />
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm card-hover-subtle">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.bed_occupancy_rate}%</p>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Taux d'occupation</p>
            <div className="mt-2">
              <ProgressBar
                value={stats.bed_occupancy_rate}
                color={stats.bed_occupancy_rate > 80 ? "bg-red-500" : stats.bed_occupancy_rate > 60 ? "bg-amber-500" : "bg-emerald-500"}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ FACTURATION ══ */}
      <section>
        <SectionHeader icon={BadgeEuro} title="Facturation & Revenus" color="bg-amber-500/10 text-amber-600" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={CheckCircle2} label="Factures Payées" value={fmt(stats.paid_invoices)} color="bg-emerald-500/10 text-emerald-600" />
            <StatCard icon={Clock} label="En Attente" value={fmt(stats.pending_invoices)} color="bg-amber-500/10 text-amber-600" />
            <StatCard icon={Wallet} label="Revenus Totaux" value={fmtCur(stats.total_revenue)} color="bg-blue-500/10 text-blue-600" />
            <StatCard icon={TrendingUp} label="Revenus du Mois" value={fmtCur(stats.month_revenue)} color="bg-violet-500/10 text-violet-600" />
            <div className="col-span-2 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">Taux de paiement</p>
              <p className="text-2xl font-bold text-foreground">{stats.payment_rate}%</p>
              <ProgressBar value={stats.payment_rate} color="bg-amber-500" />
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">Revenus — 6 derniers mois</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenue_chart_data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="" />} formatter={(v: number) => fmtCur(v)} />
                <Bar dataKey="revenue" name="Revenus" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ══ ROW: AMBULANCE + SERVICES + UTILISATEURS ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Ambulance */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader icon={Ambulance} title="Ambulances" color="bg-red-500/10 text-red-600" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500" />Terminées</div>
              <span className="font-bold text-foreground">{fmt(stats.ambulance_completed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4 text-amber-500" />En attente</div>
              <span className="font-bold text-foreground">{fmt(stats.ambulance_pending)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertCircle className="w-4 h-4 text-red-500" />Urgentes</div>
              <span className="font-bold text-red-600">{fmt(stats.ambulance_urgent)}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader icon={Building2} title="Services" color="bg-teal-500/10 text-teal-600" />
          <div className="flex flex-col items-center justify-center h-24 gap-1">
            <p className="text-5xl font-bold text-foreground">{fmt(stats.total_services)}</p>
            <p className="text-sm text-muted-foreground">Services actifs</p>
          </div>
        </div>

        {/* Utilisateurs */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <SectionHeader icon={Users} title="Utilisateurs" color="bg-indigo-500/10 text-indigo-600" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">{fmt(stats.total_users)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Actifs</span>
              <span className="font-bold text-emerald-600">{fmt(stats.active_users)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Inactifs</span>
              <span className="font-bold text-muted-foreground">{fmt(stats.inactive_users)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Médecins</span><span className="font-semibold">{fmt(stats.doctors_count)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Infirmiers</span><span className="font-semibold">{fmt(stats.nurses_count)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Réception</span><span className="font-semibold">{fmt(stats.reception_count)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Users Pie ── */}
      {usersPieData.length > 0 && (
        <section>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-4">Répartition des utilisateurs</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={usersPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {usersPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {usersPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </span>
                    <span className="font-semibold text-foreground">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
