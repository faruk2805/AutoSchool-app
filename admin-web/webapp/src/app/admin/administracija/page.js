"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function Administracija() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("administracija");
  const [isLoading, setIsLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [examRegistrations, setExamRegistrations] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExamSession, setNewExamSession] = useState({
    tip: "teorija",
    datum: new Date().toISOString().split('T')[0],
    vrijeme: "09:00",
    maxKandidata: 10,
    lokacija: ""
  });
  const [activeTab, setActiveTab] = useState("izvjestaji");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [showBodoviModal, setShowBodoviModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [bodovi, setBodovi] = useState("");
  const router = useRouter();

  // Mock podaci
  const mockInstructors = [
    {
      _id: '68ddb01cebb9729427e99c14',
      name: 'Amir',
      surname: 'Hodzic',
      email: 'amir.hodzic@auto-skola.ba',
      jmbg: '1501980123456',
      role: 'instructor',
      specijalizacija: ['teorija', 'voznja'],
      brojKandidata: 24,
      status: 'aktivan',
      brojLicence: 'LIC-2022-001',
      autoSkola: 'AutoSkola Bihac',
      adresaAutoSkole: 'Bihac, bb',
      brojRjesenja: 'RJS-2020-123',
      createdAt: '2022-03-15T08:00:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c15',
      name: 'Lejla',
      surname: 'Hasanovic',
      email: 'lejla.hasanovic@auto-skola.ba',
      jmbg: '2001985123456',
      role: 'instructor',
      specijalizacija: ['prva_pomoc', 'teorija'],
      brojKandidata: 18,
      status: 'aktivan',
      brojLicence: 'LIC-2022-002',
      autoSkola: 'AutoSkola Bihac',
      adresaAutoSkole: 'Bihac, bb',
      brojRjesenja: 'RJS-2020-123',
      createdAt: '2022-05-20T08:00:00.000Z'
    }
  ];

  const mockCandidates = [
    {
      _id: '68eade989edcf654f0b85fe3',
      name: 'Faruk',
      surname: 'Fazlic',
      email: 'faruk.fazlic@example.com',
      jmbg: '0101990123456',
      role: 'candidate',
      instruktor: '68ddb01cebb9729427e99c14',
      imeOca: 'Meho',
      datumRodjenja: '1990-01-01',
      mjestoRodjenja: 'Bihac',
      adresa: 'Bihac, ulica Example 123',
      telefon: '061123456',
      kategorija: 'B',
      brojUpisnika: 'UPIS-2023-001',
      datumPocetka: '2023-09-01',
      datumZavrsetka: '2023-10-15',
      satiTeorije: 28,
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        }
      },
      createdAt: '2023-09-22T08:00:00.000Z'
    },
    {
      _id: '13eade14dasf654f0b85fe3',
      name: 'Haris',
      surname: 'Hadzic',
      email: 'haris.hadzic@example.com',
      jmbg: '0101995123456',
      role: 'candidate',
      instruktor: '68ddb01cebb9729427e99c15',
      imeOca: 'Hasan',
      datumRodjenja: '1995-05-15',
      mjestoRodjenja: 'Bihac',
      adresa: 'Bihac, ulica Test 456',
      telefon: '061987654',
      kategorija: 'B',
      brojUpisnika: 'UPIS-2023-002',
      datumPocetka: '2023-10-01',
      datumZavrsetka: '2023-11-15',
      satiTeorije: 28,
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        }
      },
      createdAt: '2023-11-10T08:00:00.000Z'
    }
  ];

  const mockExamSessions = [
    {
      _id: 'session1',
      tip: 'teorija',
      datum: '2024-01-15',
      vrijeme: '09:00',
      lokacija: 'Masinska skola Bihac',
      maxKandidata: 20,
      prijavljeniKandidati: ['68eade989edcf654f0b85fe3', '13eade14dasf654f0b85fe3'],
      instruktor: '68ddb01cebb9729427e99c14',
      status: 'otvoren',
      createdAt: '2024-01-10T08:00:00.000Z'
    },
    {
      _id: 'session2',
      tip: 'prva_pomoc',
      datum: '2024-01-16',
      vrijeme: '10:00',
      lokacija: 'Crveni kriz Bihac',
      maxKandidata: 15,
      prijavljeniKandidati: ['68eade989edcf654f0b85fe3'],
      instruktor: '68ddb01cebb9729427e99c15',
      status: 'otvoren',
      createdAt: '2024-01-11T10:00:00.000Z'
    }
  ];

  const mockExamRegistrations = [
    {
      _id: 'reg1',
      kandidat: '68eade989edcf654f0b85fe3',
      ispitniRok: 'session1',
      tipIspita: 'teorija',
      datumPrijave: '2024-01-10T09:30:00.000Z',
      status: 'prijavljen',
      rezultat: null,
      bodovi: null
    },
    {
      _id: 'reg2',
      kandidat: '13eade14dasf654f0b85fe3',
      ispitniRok: 'session1',
      tipIspita: 'teorija',
      datumPrijave: '2024-01-10T10:15:00.000Z',
      status: 'prijavljen',
      rezultat: null,
      bodovi: null
    }
  ];

  const mockDailyReports = [
    {
      _id: 'report1',
      instruktor: '68ddb01cebb9729427e99c14',
      datum: new Date().toISOString().split('T')[0],
      aktivnosti: [
        {
          kandidat: '68eade989edcf654f0b85fe3',
          tip: 'voznja',
          vrijemeOd: '08:00',
          vrijemeDo: '09:00',
          trajanje: 60
        },
        {
          kandidat: '13eade14dasf654f0b85fe3',
          tip: 'voznja',
          vrijemeOd: '09:30',
          vrijemeDo: '10:30',
          trajanje: 60
        }
      ],
      ukupnoSati: 2,
      potpisInstruktora: 'Amir Hodzic',
      createdAt: new Date().toISOString()
    }
  ];

  // Funkcija za provjeru statusa API-ja
  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus('online');
        return true;
      } else {
        setApiStatus('offline');
        return false;
      }
    } catch (error) {
      console.log('API nije dostupan, koriste se mock podaci');
      setApiStatus('offline');
      return false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userData = localStorage.getItem("user");

      if (!token || role !== "admin") {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      
      const isApiOnline = await checkApiStatus();
      
      if (isApiOnline) {
        try {
          await Promise.all([
            fetchInstructors(),
            fetchCandidates(),
            fetchExamSessions(),
            fetchExamRegistrations(),
            fetchDailyReports()
          ]);
        } catch (error) {
          console.error('Greška pri učitavanju podataka:', error);
          loadMockData();
        }
      } else {
        loadMockData();
      }

      setUser(JSON.parse(userData));
      setIsLoading(false);
    };

    initializeApp();
  }, [router]);

  const loadMockData = () => {
    setInstructors(mockInstructors);
    setCandidates(mockCandidates);
    setExamSessions(mockExamSessions);
    setExamRegistrations(mockExamRegistrations);
    setDailyReports(mockDailyReports);
  };

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiInstructors = await response.json();
        setInstructors(apiInstructors);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }
  };

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiCandidates = await response.json();
        setCandidates(apiCandidates);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  };

  const fetchExamSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exams/open', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiSessions = await response.json();
        setExamSessions(apiSessions);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching exam sessions:', error);
      throw error;
    }
  };

  const fetchExamRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exams/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiRegistrations = await response.json();
        setExamRegistrations(apiRegistrations);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching exam registrations:', error);
      throw error;
    }
  };

  const fetchDailyReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/daily', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiReports = await response.json();
        setDailyReports(apiReports);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      throw error;
    }
  };

  const handleCreateExamSession = async () => {
    if (apiStatus === 'offline') {
      const newSession = {
        _id: 'session' + Date.now(),
        ...newExamSession,
        prijavljeniKandidati: [],
        instruktor: mockInstructors[0]._id,
        status: 'otvoren',
        createdAt: new Date().toISOString()
      };
      
      setExamSessions(prev => [...prev, newSession]);
      setNewExamSession({
        tip: "teorija",
        datum: new Date().toISOString().split('T')[0],
        vrijeme: "09:00",
        maxKandidata: 10,
        lokacija: ""
      });
      showSnackbar('Ispitni rok uspješno kreiran ', 'success');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exams/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExamSession)
      });
      
      if (response.ok) {
        const session = await response.json();
        setExamSessions(prev => [...prev, session]);
        setNewExamSession({
          tip: "teorija",
          datum: new Date().toISOString().split('T')[0],
          vrijeme: "09:00",
          maxKandidata: 10,
          lokacija: ""
        });
        showSnackbar('Ispitni rok uspješno kreiran', 'success');
      } else {
        throw new Error('Greška pri kreiranju ispitnog roka');
      }
    } catch (error) {
      console.error('Error creating exam session:', error);
      showSnackbar('Greška pri kreiranju ispitnog roka', 'error');
    }
  };

  const handleCloseExamSession = async (sessionId) => {
    if (apiStatus === 'offline') {
      setExamSessions(prev => prev.map(session => 
        session._id === sessionId ? { ...session, status: 'zatvoren' } : session
      ));
      showSnackbar('Ispitni rok uspješno zatvoren', 'success');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exams/close/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setExamSessions(prev => prev.map(session => 
          session._id === sessionId ? { ...session, status: 'zatvoren' } : session
        ));
        showSnackbar('Ispitni rok uspješno zatvoren', 'success');
      } else {
        throw new Error('Greška pri zatvaranju ispitnog roka');
      }
    } catch (error) {
      console.error('Error closing exam session:', error);
      showSnackbar('Greška pri zatvaranju ispitnog roka', 'error');
    }
  };

  const handleOpenBodoviModal = (registration, status) => {
    setSelectedRegistration({ ...registration, rezultat: status });
    setBodovi("");
    setShowBodoviModal(true);
  };

  const handleUpdateExamResult = async () => {
    if (!bodovi || isNaN(bodovi)) {
      showSnackbar('Unesite validan broj bodova', 'error');
      return;
    }

    const bodoviNum = parseInt(bodovi);
    const status = selectedRegistration.rezultat;

    if (apiStatus === 'offline') {
      setExamRegistrations(prev => prev.map(reg => 
        reg._id === selectedRegistration._id ? { 
          ...reg, 
          status: 'zavrsen', 
          rezultat: status, 
          bodovi: bodoviNum 
        } : reg
      ));
      setShowBodoviModal(false);
      showSnackbar('Rezultat uspješno unesen', 'success');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exams/result/${selectedRegistration._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, bodovi: bodoviNum })
      });
      
      if (response.ok) {
        setExamRegistrations(prev => prev.map(reg => 
          reg._id === selectedRegistration._id ? { 
            ...reg, 
            status: 'zavrsen', 
            rezultat: status, 
            bodovi: bodoviNum 
          } : reg
        ));
        setShowBodoviModal(false);
        showSnackbar('Rezultat uspješno unesen', 'success');
      } else {
        throw new Error('Greška pri unosu rezultata');
      }
    } catch (error) {
      console.error('Error updating exam result:', error);
      showSnackbar('Greška pri unosu rezultata', 'error');
    }
  };

  const handleGenerateDailyReport = async (instructorId) => {
    const instructor = instructors.find(inst => inst._id === instructorId);
    
    if (apiStatus === 'offline') {
      try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const sanitizeText = (text) => {
          if (!text) return '';
          return text
            .replace(/ć/gi, 'c')
            .replace(/č/gi, 'c')
            .replace(/š/gi, 's')
            .replace(/ž/gi, 'z')
            .replace(/đ/gi, 'dj')
            .replace(/Ć/gi, 'C')
            .replace(/Č/gi, 'C')
            .replace(/Š/gi, 'S')
            .replace(/Ž/gi, 'Z')
            .replace(/Đ/gi, 'Dj');
        };

        page.drawText('AUTOSKOLA – EVIDENCIJA CASOVA VOZNJE', {
          x: 50,
          y: height - 50,
          size: 16,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Autoskola: ${sanitizeText(instructor?.autoSkola) || 'AUTOSKOLA BIHAC'}`, {
          x: 50,
          y: height - 80,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Instruktor: ${sanitizeText(instructor?.name)} ${sanitizeText(instructor?.surname)}`, {
          x: 50,
          y: height - 100,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(`Datum: ${formatDate(selectedDate)}`, {
          x: 50,
          y: height - 120,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        const tableTop = height - 160;
        const rowHeight = 25;
        const colWidths = [40, 80, 80, 80, 100, 150, 150];
        const headers = ['Cas', 'Datum', 'Pocetak', 'Zavrsetak', 'Trajanje (min)', 'Potpis instruktora', 'Potpis kandidata'];
        
        let x = 40;
        headers.forEach((header, i) => {
          page.drawRectangle({
            x: x,
            y: tableTop - rowHeight,
            width: colWidths[i],
            height: rowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          page.drawText(header, {
            x: x + 5,
            y: tableTop - rowHeight + 7,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
            maxWidth: colWidths[i] - 10,
          });
          x += colWidths[i];
        });
        
        const termini = [];
        for (let i = 0; i < 6; i++) {
          const sat = 8 + i;
          termini.push({
            vrijemeOd: `${sat}:00`,
            vrijemeDo: `${sat + 1}:00`,
            trajanje: 60
          });
        }
        
        termini.forEach((termin, i) => {
          x = 40;
          const y = tableTop - rowHeight * (i + 2);
          
          const values = [
            (i + 1).toString(),
            selectedDate,
            termin.vrijemeOd,
            termin.vrijemeDo,
            termin.trajanje.toString(),
            '',
            ''
          ];
          
          values.forEach((val, j) => {
            page.drawRectangle({
              x: x,
              y: y,
              width: colWidths[j],
              height: rowHeight,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });
            page.drawText(val, {
              x: x + 5,
              y: y + 7,
              size: 9,
              font: font,
              color: rgb(0, 0, 0),
              maxWidth: colWidths[j] - 10,
            });
            x += colWidths[j];
          });
        });
        
        const notesY = tableTop - rowHeight * (termini.length + 4);
        page.drawText('Napomena instruktora: ________________________________________________', {
          x: 40,
          y: notesY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        page.drawText('Potpis instruktora: ____________________    Pecat autoskole: ____________', {
          x: 40,
          y: notesY - 30,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nalog_voznje_${sanitizeText(instructor?.name)}_${sanitizeText(instructor?.surname)}_${selectedDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const newReport = {
          _id: 'report' + Date.now(),
          instruktor: instructorId,
          datum: selectedDate,
          aktivnosti: termini.map((termin, index) => ({
            kandidat: '',
            tip: 'voznja',
            vrijemeOd: termin.vrijemeOd,
            vrijemeDo: termin.vrijemeDo,
            trajanje: termin.trajanje
          })),
          ukupnoSati: 6,
          potpisInstruktora: `${instructor.name} ${instructor.surname}`,
          createdAt: new Date().toISOString()
        };
        
        setDailyReports(prev => [...prev, newReport]);
        showSnackbar('PDF uspješno generisan i preuzet!', 'success');
        
      } catch (error) {
        console.error('Greška pri generisanju PDF-a:', error);
        showSnackbar('Greška pri generisanju PDF-a', 'error');
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/generate-daily?datum=${selectedDate}&instruktor=${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        showSnackbar('Dnevni izvještaj uspješno generisan', 'success');
        window.open(`http://localhost:5000/api/reports/download/${result.fileName}`, '_blank');
      } else {
        throw new Error('Greška pri generisanju izvještaja');
      }
    } catch (error) {
      console.error('Error generating daily report:', error);
      showSnackbar('Greška pri generisanju izvještaja', 'error');
    }
  };

  const handleGeneratePrijavnica = async (candidateId, examSessionId) => {
    const candidate = candidates.find(c => c._id === candidateId);
    const examSession = examSessions.find(s => s._id === examSessionId);
    const instructor = instructors.find(i => i._id === candidate?.instruktor);

    if (!candidate || !examSession || !instructor) {
      showSnackbar('Podaci nisu potpuni za generisanje prijavnice', 'error');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([298, 420]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const sanitizeText = (text) => {
        if (!text) return '';
        return text
          .replace(/ć/gi, 'c')
          .replace(/č/gi, 'c')
          .replace(/š/gi, 's')
          .replace(/ž/gi, 'z')
          .replace(/đ/gi, 'dj')
          .replace(/Ć/gi, 'C')
          .replace(/Č/gi, 'C')
          .replace(/Š/gi, 'S')
          .replace(/Ž/gi, 'Z')
          .replace(/Đ/gi, 'Dj');
      };

      page.drawText('PRIJAVNICA ZA TEORIJSKI ISPIT', {
        x: 20,
        y: height - 30,
        size: 10,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      page.drawLine({
        start: { x: 20, y: height - 35 },
        end: { x: width - 20, y: height - 35 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      let yPosition = height - 50;

      page.drawText('1. PODACI O KANDIDATU', {
        x: 20,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;

      const candidateData = [
        `Ime i prezime: ${sanitizeText(candidate.name)} ${sanitizeText(candidate.surname)}`,
        `Ime oca: ${sanitizeText(candidate.imeOca)}`,
        `Datum i mjesto rodjenja: ${formatDate(candidate.datumRodjenja)}, ${sanitizeText(candidate.mjestoRodjenja)}`,
        `JMBG: ${candidate.jmbg}`,
        `Adresa: ${sanitizeText(candidate.adresa)}`,
        `Telefon: ${candidate.telefon}`,
        `Kategorija: ${candidate.kategorija}`
      ];

      candidateData.forEach(text => {
        page.drawText(text, {
          x: 25,
          y: yPosition,
          size: 7,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
      });

      yPosition -= 5;

      page.drawText('2. PODACI O AUTOSKOLI', {
        x: 20,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;

      const autoSkolaData = [
        `Naziv: ${sanitizeText(instructor.autoSkola)}`,
        `Adresa: ${sanitizeText(instructor.adresaAutoSkole)}`,
        `Broj rjesenja: ${instructor.brojRjesenja}`,
        `Instruktor: ${sanitizeText(instructor.name)} ${sanitizeText(instructor.surname)}`,
        `Broj licence: ${instructor.brojLicence}`
      ];

      autoSkolaData.forEach(text => {
        page.drawText(text, {
          x: 25,
          y: yPosition,
          size: 7,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
      });

      yPosition -= 5;

      page.drawText('3. PODACI O OSPOSOBLJAVANJU', {
        x: 20,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;

      const obukaData = [
        `Broj upisnika: ${candidate.brojUpisnika}`,
        `Period obuke: ${formatDate(candidate.datumPocetka)} - ${formatDate(candidate.datumZavrsetka)}`,
        `Sati teorije: ${candidate.satiTeorije}`,
        `Status: Zavrsena teorijska obuka`
      ];

      obukaData.forEach(text => {
        page.drawText(text, {
          x: 25,
          y: yPosition,
          size: 7,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
      });

      yPosition -= 5;

      page.drawText('4. PODACI O ISPITU', {
        x: 20,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;

      const ispitData = [
        `Vrsta ispita: Teorijski dio`,
        `Datum prijave: ${formatDate(new Date().toISOString())}`,
        `Termin ispita: ${formatDate(examSession.datum)} u ${examSession.vrijeme}`,
        `Mjesto: ${sanitizeText(examSession.lokacija)}`,
        `Napomena: Prvi izlazak`
      ];

      ispitData.forEach(text => {
        page.drawText(text, {
          x: 25,
          y: yPosition,
          size: 7,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 12;
      });

      yPosition -= 10;

      const potpisiData = [
        'Potpis kandidata: ___________________',
        'Potpis instruktora: ___________________',
        'Pecat autoskole: [PECAT]'
      ];

      potpisiData.forEach(text => {
        page.drawText(text, {
          x: 20,
          y: yPosition,
          size: 7,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prijavnica_${sanitizeText(candidate.name)}_${sanitizeText(candidate.surname)}_${examSession.datum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar('Prijavnica uspješno generisana!', 'success');

    } catch (error) {
      console.error('Greška pri generisanju prijavnice:', error);
      showSnackbar('Greška pri generisanju prijavnice', 'error');
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

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name, surname) => {
    if (!name || !surname) return '??';
    return `${name[0] || ''}${surname[0] || ''}`;
  };

  const getExamTypeDisplay = (tip) => {
    const types = {
      'teorija': 'Teorija vožnje',
      'prva_pomoc': 'Prva pomoć',
      'voznja': 'Glavna vožnja'
    };
    return types[tip] || tip;
  };

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(inst => inst._id === instructorId);
    return instructor ? `${instructor.name} ${instructor.surname}` : 'Nepoznat instruktor';
  };

  const getCandidateName = (candidateId) => {
    const candidate = candidates.find(cand => cand._id === candidateId);
    return candidate ? `${candidate.name} ${candidate.surname}` : 'Nepoznat kandidat';
  };

  const getStats = () => {
    const totalInstructors = instructors.length;
    const totalCandidates = candidates.length;
    const activeExamSessions = examSessions.filter(session => session.status === 'otvoren').length;
    const pendingRegistrations = examRegistrations.filter(reg => reg.status === 'prijavljen').length;

    return {
      totalInstructors,
      totalCandidates,
      activeExamSessions,
      pendingRegistrations
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-2xl shadow-[#6C63FF]/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
              <span className="text-4xl animate-pulse-slow">📊</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#6C63FF] via-[#FF4DA6] to-[#3D9DF6] bg-clip-text text-transparent animate-gradient-text">
              Učitavanje administracije
            </h1>
            <div className="h-8 flex items-center justify-center">
              <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#6C63FF] w-0 mx-auto">
                {apiStatus === 'checking' ? 'Provjeravam API...' : 'Učitavam podatke...'}
              </p>
            </div>
          </div>

          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-[#232634] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] rounded-full animate-loading-bar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] text-white">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#6C63FF]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Administracija sistema
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Upravljanje instruktorima, ispitima i izvještajima
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#6C63FF]/20 hover:border-[#6C63FF]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Instruktori" 
                value={stats.totalInstructors.toString()} 
                trend={`${instructors.filter(i => i.status === 'aktivan').length} aktivnih`}
                icon="👨‍🏫"
                color="from-[#6C63FF] to-[#FF4DA6]"
                trendColor="text-[#27AE60]"
                description="Ukupno instruktora"
                index={0}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Kandidati" 
                value={stats.totalCandidates.toString()} 
                trend={`${candidates.filter(c => c.status?.teorijaPrvaPomoc).length} završili teoriju`}
                icon="👥"
                color="from-[#27AE60] to-[#6FCF97]"
                trendColor="text-[#27AE60]"
                description="Svi kandidati"
                index={1}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Aktivni ispiti" 
                value={stats.activeExamSessions.toString()} 
                trend={`${stats.pendingRegistrations} prijava`}
                icon="📝"
                color="from-[#3D9DF6] to-[#56CCF2]"
                trendColor="text-[#3D9DF6]"
                description="Otvoreni ispitni rokovi"
                index={2}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Dnevni izvještaji" 
                value={dailyReports.filter(r => r.datum === selectedDate).length.toString()} 
                trend="Danas"
                icon="📋"
                color="from-[#FF6B35] to-[#FF9D6C]"
                trendColor="text-[#FF6B35]"
                description="Nalozi za danas"
                index={3}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
            </div>

            <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20">
              <div className="border-b border-[#2A2D3A]">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "izvjestaji", label: "📋 Dnevni Izvještaji", icon: "📋" },
                    { id: "ispiti", label: "📝 Ispitni Rokovi", icon: "📝" },
                    { id: "prijave", label: "👥 Prijave Ispita", icon: "👥" },
                    { id: "prijavnice", label: "📄 Prijavnice", icon: "📄" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-[#6C63FF] text-white'
                          : 'border-transparent text-[#B0B3C1] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "izvjestaji" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Dnevni nalozi instruktora</h3>
                      <div className="flex items-center space-x-4">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {instructors.map((instructor) => (
                        <div key={instructor._id} className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                            {getInitials(instructor.name, instructor.surname)}
                          </div>
                          <h4 className="text-white font-semibold text-lg mb-2">
                            {instructor.name} {instructor.surname}
                          </h4>
                          <p className="text-[#B0B3C1] text-sm mb-4">
                            {instructor.brojKandidata} kandidata
                          </p>
                          <button
                            onClick={() => handleGenerateDailyReport(instructor._id)}
                            className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300"
                          >
                            Generiši PDF Nalog
                          </button>
                        </div>
                      ))}
                    </div>

                    {dailyReports.filter(report => report.datum === selectedDate).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-[#B0B3C1] text-lg">Nema dnevnih naloga za odabrani datum</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dailyReports
                          .filter(report => report.datum === selectedDate)
                          .map((report, index) => (
                            <div 
                              key={report._id}
                              className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6 hover:border-[#6C63FF] transition-all duration-300 animate-fadeIn"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-xl flex items-center justify-center text-white font-semibold">
                                    {getInitials(
                                      getInstructorName(report.instruktor).split(' ')[0],
                                      getInstructorName(report.instruktor).split(' ')[1]
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-semibold text-lg">
                                      {getInstructorName(report.instruktor)}
                                    </h4>
                                    <p className="text-[#B0B3C1]">
                                      {formatDate(report.datum)} • {report.ukupnoSati} sati
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[#B0B3C1] text-sm">Potpis</p>
                                  <p className="text-white font-semibold">{report.potpisInstruktora}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <h5 className="text-white font-semibold">Aktivnosti:</h5>
                                {report.aktivnosti.map((aktivnost, idx) => (
                                  <div key={idx} className="bg-[#1A1C25] rounded-lg p-4 border border-[#2A2D3A]">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-white font-medium">
                                          {getCandidateName(aktivnost.kandidat)}
                                        </p>
                                        <p className="text-[#B0B3C1] text-sm">
                                          Vožnja • {aktivnost.vrijemeOd} - {aktivnost.vrijemeDo} • {aktivnost.trajanje} min
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "ispiti" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Kreiraj novi ispitni rok</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[#B0B3C1] text-sm mb-2 block">Tip ispita</label>
                              <select
                                value={newExamSession.tip}
                                onChange={(e) => setNewExamSession({...newExamSession, tip: e.target.value})}
                                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                              >
                                <option value="teorija">Teorija vožnje</option>
                                <option value="prva_pomoc">Prva pomoć</option>
                                <option value="voznja">Glavna vožnja</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[#B0B3C1] text-sm mb-2 block">Datum</label>
                              <input
                                type="date"
                                value={newExamSession.datum}
                                onChange={(e) => setNewExamSession({...newExamSession, datum: e.target.value})}
                                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[#B0B3C1] text-sm mb-2 block">Vrijeme</label>
                              <input
                                type="time"
                                value={newExamSession.vrijeme}
                                onChange={(e) => setNewExamSession({...newExamSession, vrijeme: e.target.value})}
                                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                              />
                            </div>
                            <div>
                              <label className="text-[#B0B3C1] text-sm mb-2 block">Max kandidata</label>
                              <input
                                type="number"
                                value={newExamSession.maxKandidata}
                                onChange={(e) => setNewExamSession({...newExamSession, maxKandidata: parseInt(e.target.value)})}
                                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                                min="1"
                                max="50"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[#B0B3C1] text-sm mb-2 block">Lokacija</label>
                            <input
                              type="text"
                              value={newExamSession.lokacija}
                              onChange={(e) => setNewExamSession({...newExamSession, lokacija: e.target.value})}
                              placeholder="Unesite lokaciju održavanja ispita"
                              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                            />
                          </div>
                          <button
                            onClick={handleCreateExamSession}
                            disabled={!newExamSession.lokacija.trim()}
                            className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Kreiraj ispitni rok
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Aktivni ispitni rokovi</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {examSessions.filter(session => session.status === 'otvoren').length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-3">📝</div>
                              <p className="text-[#B0B3C1]">Nema aktivnih ispitnih rokova</p>
                            </div>
                          ) : (
                            examSessions
                              .filter(session => session.status === 'otvoren')
                              .map((session, index) => (
                                <div 
                                  key={session._id}
                                  className="bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-4 hover:border-[#6C63FF] transition-all duration-300 animate-fadeIn"
                                  style={{ animationDelay: `${index * 100}ms` }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                                        session.tip === 'teorija' ? 'bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6]' :
                                        session.tip === 'prva_pomoc' ? 'bg-gradient-to-br from-[#27AE60] to-[#6FCF97]' :
                                        'bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2]'
                                      }`}>
                                        {session.tip === 'teorija' ? '📚' : session.tip === 'prva_pomoc' ? '🆘' : '🚗'}
                                      </div>
                                      <div>
                                        <h4 className="text-white font-semibold">
                                          {getExamTypeDisplay(session.tip)}
                                        </h4>
                                        <p className="text-[#B0B3C1] text-sm">
                                          {formatDate(session.datum)} • {session.vrijeme}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        session.status === 'otvoren' 
                                          ? 'bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/30'
                                          : 'bg-[#EB5757]/20 text-[#EB5757] border border-[#EB5757]/30'
                                      }`}>
                                        {session.status === 'otvoren' ? 'Otvoren' : 'Zatvoren'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-[#B0B3C1]">Lokacija:</p>
                                      <p className="text-white">{session.lokacija}</p>
                                    </div>
                                    <div>
                                      <p className="text-[#B0B3C1]">Instruktor:</p>
                                      <p className="text-white">{getInstructorName(session.instruktor)}</p>
                                    </div>
                                    <div>
                                      <p className="text-[#B0B3C1]">Prijavljeno:</p>
                                      <p className="text-white">
                                        {session.prijavljeniKandidati.length} / {session.maxKandidata}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[#B0B3C1]">Status:</p>
                                      <p className="text-white">
                                        {session.prijavljeniKandidati.length >= session.maxKandidata 
                                          ? 'Popunjeno' 
                                          : 'Ima mjesta'
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex space-x-2 mt-4">
                                    <button
                                      onClick={() => handleCloseExamSession(session._id)}
                                      className="flex-1 bg-[#EB5757] text-white py-2 rounded-lg font-medium hover:bg-[#EB5757]/80 transition-colors duration-300"
                                    >
                                      Zatvori prijave
                                    </button>
                                    <button className="flex-1 bg-[#2A2D3A] text-white py-2 rounded-lg font-medium hover:bg-[#3D9DF6] transition-colors duration-300">
                                      Detalji
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "prijave" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Aktivne prijave ispita</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {examRegistrations.filter(reg => reg.status === 'prijavljen').length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-3">👥</div>
                              <p className="text-[#B0B3C1]">Nema aktivnih prijava ispita</p>
                            </div>
                          ) : (
                            examRegistrations
                              .filter(reg => reg.status === 'prijavljen')
                              .map((registration, index) => {
                                const session = examSessions.find(s => s._id === registration.ispitniRok);
                                const candidate = candidates.find(c => c._id === registration.kandidat);
                                
                                return (
                                  <div 
                                    key={registration._id}
                                    className="bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-4 hover:border-[#6C63FF] transition-all duration-300 animate-fadeIn"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-xl flex items-center justify-center text-white font-semibold">
                                          {getInitials(candidate?.name, candidate?.surname)}
                                        </div>
                                        <div>
                                          <h4 className="text-white font-semibold">
                                            {candidate ? `${candidate.name} ${candidate.surname}` : 'Nepoznat kandidat'}
                                          </h4>
                                          <p className="text-[#B0B3C1] text-sm">
                                            {getExamTypeDisplay(registration.tipIspita)}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 bg-[#3D9DF6]/20 text-[#3D9DF6] rounded-full text-xs font-medium border border-[#3D9DF6]/30">
                                        Prijavljen
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                      <div>
                                        <p className="text-[#B0B3C1]">Datum prijave:</p>
                                        <p className="text-white">{formatDateTime(registration.datumPrijave)}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#B0B3C1">Termin ispita:</p>
                                        <p className="text-white">
                                          {session ? `${formatDate(session.datum)} • ${session.vrijeme}` : 'Nepoznat termin'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleOpenBodoviModal(registration, 'polozio')}
                                        className="flex-1 bg-[#27AE60] text-white py-2 rounded-lg font-medium hover:bg-[#27AE60]/80 transition-colors duration-300"
                                      >
                                        Položio
                                      </button>
                                      <button
                                        onClick={() => handleOpenBodoviModal(registration, 'pao')}
                                        className="flex-1 bg-[#EB5757] text-white py-2 rounded-lg font-medium hover:bg-[#EB5757]/80 transition-colors duration-300"
                                      >
                                        Pao
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>

                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Završene prijave</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {examRegistrations.filter(reg => reg.status === 'zavrsen').length === 0 ? (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-3">✅</div>
                              <p className="text-[#B0B3C1]">Nema završenih prijava</p>
                            </div>
                          ) : (
                            examRegistrations
                              .filter(reg => reg.status === 'zavrsen')
                              .map((registration, index) => {
                                const candidate = candidates.find(c => c._id === registration.kandidat);
                                
                                return (
                                  <div 
                                    key={registration._id}
                                    className="bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-4 hover:border-[#6C63FF]/50 transition-all duration-300 animate-fadeIn"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                                          registration.rezultat === 'polozio' 
                                            ? 'bg-[#27AE60]' 
                                            : 'bg-[#EB5757]'
                                        }`}>
                                          {registration.rezultat === 'polozio' ? '✓' : '✗'}
                                        </div>
                                        <div>
                                          <h4 className="text-white font-medium">
                                            {candidate ? `${candidate.name} ${candidate.surname}` : 'Nepoznat kandidat'}
                                          </h4>
                                          <p className="text-[#B0B3C1] text-sm">
                                            {getExamTypeDisplay(registration.tipIspita)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className={`font-semibold ${
                                          registration.rezultat === 'polozio' 
                                            ? 'text-[#27AE60]' 
                                            : 'text-[#EB5757]'
                                        }`}>
                                          {registration.rezultat === 'polozio' ? 'Položio' : 'Pao'}
                                        </p>
                                        <p className="text-[#B0B3C1] text-sm">
                                          {registration.bodovi} bodova
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "prijavnice" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">Generisanje Prijavnica</h3>
                      <p className="text-[#B0B3C1]">Generiši prijavnice za teorijski ispit</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-white mb-4">Kandidati spremni za ispit</h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {candidates
                            .filter(candidate => candidate.status?.teorijaPrvaPomoc)
                            .map((candidate, index) => (
                              <div key={candidate._id} className="bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-xl flex items-center justify-center text-white font-semibold">
                                      {getInitials(candidate.name, candidate.surname)}
                                    </div>
                                    <div>
                                      <h5 className="text-white font-semibold">
                                        {candidate.name} {candidate.surname}
                                      </h5>
                                      <p className="text-[#B0B3C1] text-sm">
                                        Kategorija {candidate.kategorija} • {getInstructorName(candidate.instruktor)}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="px-2 py-1 bg-[#27AE60]/20 text-[#27AE60] rounded-full text-xs font-medium border border-[#27AE60]/30">
                                    Spreman
                                  </span>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <select 
                                    className="flex-1 bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6C63FF]"
                                    defaultValue=""
                                  >
                                    <option value="">Odaberi ispitni rok</option>
                                    {examSessions
                                      .filter(session => session.status === 'otvoren' && session.tip === 'teorija')
                                      .map(session => (
                                        <option key={session._id} value={session._id}>
                                          {formatDate(session.datum)} • {session.vrijeme}
                                        </option>
                                      ))
                                    }
                                  </select>
                                  <button
                                    onClick={(e) => {
                                      const select = e.target.parentElement.querySelector('select');
                                      const sessionId = select.value;
                                      if (sessionId) {
                                        handleGeneratePrijavnica(candidate._id, sessionId);
                                      } else {
                                        showSnackbar('Odaberite ispitni rok', 'error');
                                      }
                                    }}
                                    className="bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300"
                                  >
                                    Generiši
                                  </button>
                                </div>
                              </div>
                            ))
                          }
                          
                          {candidates.filter(c => c.status?.teorijaPrvaPomoc).length === 0 && (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-3">📝</div>
                              <p className="text-[#B0B3C1]">Nema kandidata spremnih za ispit</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-6">
                        <h4 className="text-xl font-semibold text-white mb-4">Prijavljeni kandidati</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {examRegistrations
                            .filter(reg => reg.status === 'prijavljen')
                            .map((registration, index) => {
                              const candidate = candidates.find(c => c._id === registration.kandidat);
                              const session = examSessions.find(s => s._id === registration.ispitniRok);
                              
                              return (
                                <div key={registration._id} className="bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(candidate?.name, candidate?.surname)}
                                      </div>
                                      <div>
                                        <h5 className="text-white font-medium">
                                          {candidate?.name} {candidate?.surname}
                                        </h5>
                                        <p className="text-[#B0B3C1] text-sm">
                                          {session ? `${formatDate(session.datum)} • ${session.vrijeme}` : 'Nepoznat termin'}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleGeneratePrijavnica(registration.kandidat, registration.ispitniRok)}
                                      className="bg-[#2A2D3A] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#3D9DF6] transition-colors duration-300"
                                    >
                                      Ponovi
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          }
                          
                          {examRegistrations.filter(reg => reg.status === 'prijavljen').length === 0 && (
                            <div className="text-center py-8">
                              <div className="text-4xl mb-3">📄</div>
                              <p className="text-[#B0B3C1]">Nema generisanih prijavnica</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showBodoviModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] border border-[#2A2D3A] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Unesi rezultat - {selectedRegistration.rezultat === 'polozio' ? 'Položio' : 'Pao'}
              </h3>
              <button
                onClick={() => setShowBodoviModal(false)}
                className="text-[#B0B3C1] hover:text-white transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1A1C25] rounded-xl p-4 border border-[#2A2D3A]">
                <p className="text-[#B0B3C1] text-sm">Kandidat</p>
                <p className="text-white font-semibold">
                  {getCandidateName(selectedRegistration.kandidat)}
                </p>
              </div>

              <div className="bg-[#1A1C25] rounded-xl p-4 border border-[#2A2D3A]">
                <p className="text-[#B0B3C1] text-sm">Tip ispita</p>
                <p className="text-white font-semibold">
                  {getExamTypeDisplay(selectedRegistration.tipIspita)}
                </p>
              </div>

              <div>
                <label className="text-[#B0B3C1] text-sm mb-2 block">Broj bodova</label>
                <input
                  type="number"
                  value={bodovi}
                  onChange={(e) => setBodovi(e.target.value)}
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  placeholder="Unesite broj bodova"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleUpdateExamResult}
                  disabled={!bodovi}
                  className="flex-1 bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Potvrdi
                </button>
                <button
                  onClick={() => setShowBodoviModal(false)}
                  className="flex-1 bg-[#2A2D3A] text-white py-3 rounded-xl font-semibold hover:bg-[#3A3D4A] transition-colors duration-300"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-medium text-white shadow-2xl transition-all duration-300 animate-slideUp ${
          snackbar.severity === 'success' 
            ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97]' 
            : snackbar.severity === 'warning'
            ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF9D6C]'
            : 'bg-gradient-to-r from-[#EB5757] to-[#FF7676]'
        }`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, trend, icon, color, trendColor, description, index, hoveredCard, onHover }) => {
  return (
    <div 
      className={`bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 transform hover:-translate-y-2 animate-fadeIn ${
        hoveredCard === index ? 'border-[#6C63FF] scale-105' : 'hover:border-[#6C63FF]/50'
      }`}
      style={{ animationDelay: `${index * 200}ms` }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#B0B3C1] text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${trendColor}`}>
          {trend}
        </span>
        <span className="text-[#B0B3C1] text-xs">
          {description}
        </span>
      </div>
    </div>
  );
};