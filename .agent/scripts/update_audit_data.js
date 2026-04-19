import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXXR8OBVe58iJ4Xs4NBXK2Dlnhx1RDCpk",
  authDomain: "developer-dashboard-e0679.firebaseapp.com",
  projectId: "developer-dashboard-e0679",
  storageBucket: "developer-dashboard-e0679.firebasestorage.app",
  messagingSenderId: "156140488883",
  appId: "1:156140488883:web:0c9531917433f1303f48c6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const projectAudits = [
  {
    id: "cartao-pro",
    modules: "Conciliação Financeira, Relatórios Inteligentes, Gestão de Cartão, Rateio (Split)",
    entities: "Expenses, Cards, Categories, Persons, Transfers"
  },
  {
    id: "gestao-unidade",
    modules: "Dashboard Comercial, Solicitações FSAR, Controle de Projetos, Gestão de Usuários",
    entities: "Contacts, Roles, AppUsers, FSARFormData, Solicitations, Projects"
  },
  {
    id: "minha-saude",
    modules: "Gestação, Perfil Médico, Exames e OCR, Agenda de Saúde, Medicamentos, Diário, Vacinas",
    entities: "Profiles, Exams, Medications, Appointments, PregnancyData, Weights"
  },
  {
    id: "gabinete-ia",
    modules: "Gestão de Processos, Execução em Lote, Robô de Automação, Prompts Designer, Dashboard",
    entities: "Processes, Categories, PromptTemplates, Executions, Users"
  },
  {
    id: "meu-cofrinho",
    modules: "Dashboard Financeiro, Conciliação Bancária, Controle de Amortização, Relatórios PDF",
    entities: "Transactions, Categories, Projects (Amortization), AuditLogs"
  },
  {
    id: "jusprod",
    modules: "Registro de Produtividade, Dashboard Semanal, Geração de Relatórios",
    entities: "ActivityLog, Users, Settings"
  },
  {
    id: "lavajato-web",
    modules: "Kanban Operacional, Gestão de Funcionários, Multi-tenant, Relatórios de Entrega, Autenticação",
    entities: "Tickets, Employees, Tenants, Users, Vehicles, Services"
  }
];

async function updateAll() {
  console.log("Iniciando atualização do Firestore...");
  for (const audit of projectAudits) {
    try {
      const docRef = doc(db, "projects", audit.id);
      await updateDoc(docRef, {
        modules: audit.modules,
        entities: audit.entities,
        updatedAt: new Date()
      });
      console.log(`✅ Sucesso: ${audit.id}`);
    } catch (e) {
      console.error(`❌ Erro em ${audit.id}:`, e.message);
    }
  }
  console.log("Fim da auditoria.");
  process.exit(0);
}

updateAll();
