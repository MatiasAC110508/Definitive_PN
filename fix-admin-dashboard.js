const fs = require('fs');
let file = fs.readFileSync('src/modules/admin/presentation/admin-dashboard.tsx', 'utf8');

// Inject UserRole
file = file.replace('sales: Sale[];\n}', 'sales: Sale[];\n  userRole: string;\n}');
file = file.replace('  sales: initialSales,\n}: AdminDashboardProps) {', '  sales: initialSales,\n  userRole,\n}: AdminDashboardProps) {');
file = file.replace('const [activeTab, setActiveTab] = useState("overview");', 'const [activeTab, setActiveTab] = useState(userRole === "STAFF" ? "appointments" : "overview");');

file = file.replace(
  'TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-7 lg:w-full lg:max-w-5xl h-auto p-1 bg-[var(--quartz-soft)] rounded-xl border border-[var(--line)] gap-0.5"',
  "TabsList className={`flex w-full overflow-x-auto md:grid h-auto p-1 bg-[var(--quartz-soft)] rounded-xl border border-[var(--line)] gap-0.5 ${userRole === 'ADMIN' ? 'md:grid-cols-4 lg:grid-cols-7 lg:w-full lg:max-w-5xl' : 'grid-cols-3'}`}"
);

// We need to conditionally render: overview (Trigger + Content), users (Trigger + Content), sales (Trigger + Content), schedules (Trigger + Content)

function wrapTabsTrigger(value) {
  const regex = new RegExp(`(<TabsTrigger\\s+value="${value}"[\\s\\S]*?<\\/TabsTrigger>)`, 'g');
  file = file.replace(regex, '{userRole === "ADMIN" && (\n$1\n)}');
}

function wrapTabsContent(value) {
  const regex = new RegExp(`(<TabsContent\\s+value="${value}"[\\s\\S]*?<\\/[A-Z][a-zA-Z]*Tab>(\\s+.*)?\\s+<\\/TabsContent>)`, 'g');
  file = file.replace(regex, '{userRole === "ADMIN" && (\n$1\n)}');
}

wrapTabsTrigger('overview');
wrapTabsTrigger('users');
wrapTabsTrigger('sales');
wrapTabsTrigger('schedules');

wrapTabsContent('overview');
wrapTabsContent('users');
wrapTabsContent('sales');
wrapTabsContent('schedules');

fs.writeFileSync('src/modules/admin/presentation/admin-dashboard.tsx', file);
