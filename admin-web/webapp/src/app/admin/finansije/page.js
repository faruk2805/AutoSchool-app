"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import PaymentStats from "./components/PaymentStats";
import PaymentsList from "./components/PaymentsList";
import PaymentChart from "./components/PaymentChart";
import AddPaymentModal from "./components/AddPaymentModal";
import CandidatesList from "./components/CandidatesList";
import LoadingScreen from "./components/LoadingScreen";

export default function UplateAdmin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("uplate");
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  // Bogati mock podaci za kandidate
  const mockCandidates = [
    {
      _id: "mock_candidate_1",
      name: "Amina",
      surname: "Husić",
      email: "amina.husic@example.com",
      jmbg: "1502995123456",
      phone: "+38761123456",
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: false,
        },
      },
      totalAmount: 2500,
      paidAmount: 1800,
      remainingAmount: 700,
      createdAt: "2023-10-15T08:00:00.000Z",
    },
    {
      _id: "mock_candidate_2",
      name: "Dario",
      surname: "Madić",
      email: "dario.madic@example.com",
      jmbg: "2001993123456",
      phone: "+38762345678",
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: false,
          voznju: true,
        },
      },
      totalAmount: 2500,
      paidAmount: 2200,
      remainingAmount: 300,
      createdAt: "2023-11-05T08:00:00.000Z",
    },
    {
      _id: "mock_candidate_3",
      name: "Selma",
      surname: "Karahodžić",
      email: "selma.karahodzic@example.com",
      jmbg: "0804996123456",
      phone: "+38763456789",
      status: {
        teorijaPrvaPomoc: false,
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false,
        },
      },
      totalAmount: 2500,
      paidAmount: 500,
      remainingAmount: 2000,
      createdAt: "2023-12-01T08:00:00.000Z",
    },
    {
      _id: "mock_candidate_4",
      name: "Nermin",
      surname: "Selimović",
      email: "nermin.selimovic@example.com",
      jmbg: "1208991123456",
      phone: "+38764567890",
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true,
        },
      },
      totalAmount: 2500,
      paidAmount: 2500,
      remainingAmount: 0,
      createdAt: "2023-09-10T08:00:00.000Z",
    },
    {
      _id: "mock_candidate_5",
      name: "Lejla",
      surname: "Hadžić",
      email: "lejla.hadzic@example.com",
      jmbg: "0307998123456",
      phone: "+38765678901",
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: false,
          prvuPomoc: true,
          voznju: false,
        },
      },
      totalAmount: 2500,
      paidAmount: 1200,
      remainingAmount: 1300,
      createdAt: "2024-01-15T08:00:00.000Z",
    },
  ];

  // Bogati mock podaci za uplate
  const mockPayments = [
    {
      _id: "mock_payment_1",
      user: {
        _id: "mock_candidate_1",
        name: "Amina",
        surname: "Husić",
      },
      amount: 500,
      type: "deposit",
      description: "Početna uplata - depozit",
      method: "cash",
      date: "2023-10-20T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-10-20T08:00:00.000Z",
    },
    {
      _id: "mock_payment_2",
      user: {
        _id: "mock_candidate_1",
        name: "Amina",
        surname: "Husić",
      },
      amount: 800,
      type: "instalment",
      description: "Prva rata - teorija",
      method: "bank_transfer",
      date: "2023-11-15T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-11-15T08:00:00.000Z",
    },
    {
      _id: "mock_payment_3",
      user: {
        _id: "mock_candidate_1",
        name: "Amina",
        surname: "Husić",
      },
      amount: 500,
      type: "instalment",
      description: "Druga rata - vožnje",
      method: "card",
      date: "2024-01-10T08:00:00.000Z",
      status: "completed",
      createdAt: "2024-01-10T08:00:00.000Z",
    },
    {
      _id: "mock_payment_4",
      user: {
        _id: "mock_candidate_2",
        name: "Dario",
        surname: "Madić",
      },
      amount: 1000,
      type: "deposit",
      description: "Početna uplata",
      method: "bank_transfer",
      date: "2023-11-10T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-11-10T08:00:00.000Z",
    },
    {
      _id: "mock_payment_5",
      user: {
        _id: "mock_candidate_2",
        name: "Dario",
        surname: "Madić",
      },
      amount: 800,
      type: "instalment",
      description: "Prva rata",
      method: "cash",
      date: "2023-12-20T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-12-20T08:00:00.000Z",
    },
    {
      _id: "mock_payment_6",
      user: {
        _id: "mock_candidate_2",
        name: "Dario",
        surname: "Madić",
      },
      amount: 400,
      type: "instalment",
      description: "Druga rata",
      method: "card",
      date: "2024-02-05T08:00:00.000Z",
      status: "completed",
      createdAt: "2024-02-05T08:00:00.000Z",
    },
    {
      _id: "mock_payment_7",
      user: {
        _id: "mock_candidate_3",
        name: "Selma",
        surname: "Karahodžić",
      },
      amount: 500,
      type: "deposit",
      description: "Početna uplata",
      method: "cash",
      date: "2023-12-05T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-12-05T08:00:00.000Z",
    },
    {
      _id: "mock_payment_8",
      user: {
        _id: "mock_candidate_4",
        name: "Nermin",
        surname: "Selimović",
      },
      amount: 1500,
      type: "full",
      description: "Puna uplata - popust",
      method: "bank_transfer",
      date: "2023-09-15T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-09-15T08:00:00.000Z",
    },
    {
      _id: "mock_payment_9",
      user: {
        _id: "mock_candidate_4",
        name: "Nermin",
        surname: "Selimović",
      },
      amount: 1000,
      type: "instalment",
      description: "Završna rata",
      method: "card",
      date: "2023-12-01T08:00:00.000Z",
      status: "completed",
      createdAt: "2023-12-01T08:00:00.000Z",
    },
    {
      _id: "mock_payment_10",
      user: {
        _id: "mock_candidate_5",
        name: "Lejla",
        surname: "Hadžić",
      },
      amount: 800,
      type: "deposit",
      description: "Početna uplata",
      method: "cash",
      date: "2024-01-20T08:00:00.000Z",
      status: "completed",
      createdAt: "2024-01-20T08:00:00.000Z",
    },
    {
      _id: "mock_payment_11",
      user: {
        _id: "mock_candidate_5",
        name: "Lejla",
        surname: "Hadžić",
      },
      amount: 400,
      type: "instalment",
      description: "Prva rata",
      method: "bank_transfer",
      date: "2024-02-28T08:00:00.000Z",
      status: "pending",
      createdAt: "2024-02-28T08:00:00.000Z",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    // Simuliramo učitavanje
    setTimeout(() => {
      setUser(JSON.parse(userData));
      setIsLoading(false);
      fetchCandidates();
      fetchPayments();
    }, 1000);
  }, [router]);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const allUsers = await response.json();
        const apiCandidates = allUsers.filter(
          (user) => user.role === "candidate"
        );

        // Kombiniraj API kandidate sa mock kandidatima
        const allCandidates = [...apiCandidates, ...mockCandidates];
        setCandidates(allCandidates);
      } else {
        throw new Error("API nije dostupan");
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      // Fallback na mock podatke
      setCandidates(mockCandidates);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const apiPayments = await response.json();

        // Kombiniraj API uplate sa mock uplatama
        const allPayments = [...apiPayments, ...mockPayments];
        setPayments(allPayments);
      } else {
        throw new Error("API nije dostupan");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Fallback na mock podatke
      setPayments(mockPayments);
    }
  };

  const fetchCandidatePayments = async (candidateId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/payments/users/${candidateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const candidatePayments = await response.json();
        return candidatePayments;
      } else {
        throw new Error("API nije dostupan");
      }
    } catch (error) {
      console.error("Error fetching candidate payments:", error);
      // Fallback na mock podatke
      const filteredPayments = mockPayments.filter(
        (payment) => payment.user._id === candidateId
      );
      return filteredPayments;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleCandidateSelect = async (candidate) => {
    setSelectedCandidate(candidate);
    const candidatePayments = await fetchCandidatePayments(candidate._id);
    setPayments(candidatePayments);
  };

  const handleAddPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Uplata uspješno dodana",
          severity: "success",
        });
        setShowAddPayment(false);
        await fetchPayments();

        // Refresh candidate payments if one is selected
        if (selectedCandidate) {
          const candidatePayments = await fetchCandidatePayments(
            selectedCandidate._id
          );
          setPayments(candidatePayments);
        }
      } else {
        throw new Error("Greška pri dodavanju uplate");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      setSnackbar({
        open: true,
        message: "Greška pri dodavanju uplate",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper funkcije za statistike
  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce(
      (acc, payment) => acc + (payment.amount || 0),
      0
    );
    const completedPayments = payments.filter(
      (p) => p.status === "completed"
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.status === "pending"
    ).length;

    const monthlyData = generateMonthlyData();
    const methodData = getPaymentMethodData();
    const typeData = getPaymentTypeData();

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      monthlyData,
      methodData,
      typeData,
      averagePayment:
        totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0,
    };
  };

  // U page.js, zamijeni generateMonthlyData funkciju sa ovom:
  const generateMonthlyData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Maj",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
    ];
    const currentYear = new Date().getFullYear();

    // Generiraj realistične podatke sa trendom rasta
    return months.map((month, index) => {
      const baseAmount = 4000 + index * 400; // Rastući trend
      const randomVariation = Math.random() * 1000 - 500; // ±500 KM varijacija
      const amount = Math.max(1000, Math.round(baseAmount + randomVariation)); // Min 1000 KM
      const count = Math.max(5, Math.round(amount / 350)); // Otprilike 1 uplata na 350 KM

      return {
        month,
        amount,
        count,
      };
    });
  };

  // I zamijeni getPaymentMethodData sa ovom:
  const getPaymentMethodData = () => {
    const methods = {
      cash: { name: "Gotovina", amount: 0, count: 0, color: "#27AE60" },
      bank_transfer: {
        name: "Bankovni transfer",
        amount: 0,
        count: 0,
        color: "#2D9CDB",
      },
      card: { name: "Kartica", amount: 0, count: 0, color: "#9B51E0" },
    };

    // Ako nema pravih podataka, koristi realistične mock podatke
    if (payments.length === 0) {
      return [
        { name: "Gotovina", amount: 24500, count: 68, color: "#27AE60" },
        {
          name: "Bankovni transfer",
          amount: 31800,
          count: 42,
          color: "#2D9CDB",
        },
        { name: "Kartica", amount: 18700, count: 35, color: "#9B51E0" },
      ];
    }

    payments.forEach((payment) => {
      if (methods[payment.method]) {
        methods[payment.method].amount += payment.amount || 0;
        methods[payment.method].count += 1;
      }
    });

    return Object.values(methods);
  };

  const getPaymentTypeData = () => {
    const types = {
      deposit: { name: "Depozit", amount: 0, count: 0, color: "#6C63FF" },
      instalment: { name: "Rata", amount: 0, count: 0, color: "#FF6B35" },
      full: { name: "Puna uplata", amount: 0, count: 0, color: "#27AE60" },
    };

    payments.forEach((payment) => {
      if (types[payment.type]) {
        types[payment.type].amount += payment.amount || 0;
        types[payment.type].count += 1;
      }
    });

    return Object.values(types);
  };

  const paymentStats = getPaymentStats();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] text-white">
      {/* Sidebar Component */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#6C63FF]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Upravljanje uplatama
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Pregled uplata, statistika i finansijski izvještaji
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowAddPayment(true)}
                className="bg-[#6C63FF] text-white px-6 py-3 rounded-xl hover:bg-[#5A52D5] transition-all duration-300 shadow-lg shadow-[#6C63FF]/25 hover:shadow-[#6C63FF]/40 font-medium"
              >
                + Nova uplata
              </button>
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#6C63FF]/20 hover:border-[#6C63FF]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("bs-BA")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-8 animate-fadeIn">
            {/* Globalne statistike */}
            <PaymentStats
              paymentStats={paymentStats}
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
            />

            {/* Grafikoni */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PaymentChart
                data={paymentStats.monthlyData}
                title="Mjesečni prihodi"
                type="bar"
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
              <PaymentChart
                data={paymentStats.methodData}
                title="Načini plaćanja"
                type="doughnut"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Lista kandidata */}
              <CandidatesList
                candidates={candidates}
                selectedCandidate={selectedCandidate}
                onCandidateSelect={handleCandidateSelect}
                payments={payments}
              />

              {/* Lista uplata */}
              <div className="lg:col-span-3">
                <PaymentsList
                  payments={payments}
                  selectedCandidate={selectedCandidate}
                  onAddPayment={() => setShowAddPayment(true)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal za dodavanje uplate */}
      <AddPaymentModal
        open={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        onAddPayment={handleAddPayment}
        candidates={candidates}
      />

      {/* Snackbar za notifikacije */}
      {snackbar.open && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-xl border backdrop-blur-sm animate-slideUp ${
            snackbar.severity === "success"
              ? "bg-[#27AE60]/20 border-[#27AE60]/30 text-[#27AE60]"
              : "bg-[#FF6B35]/20 border-[#FF6B35]/30 text-[#FF6B35]"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span>{snackbar.severity === "success" ? "✅" : "⚠️"}</span>
            <span>{snackbar.message}</span>
            <button
              onClick={handleCloseSnackbar}
              className="ml-2 hover:opacity-70 transition-opacity duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
