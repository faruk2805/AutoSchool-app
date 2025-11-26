"use client";

import { useState } from 'react';

const DrivingCalendar = ({ sessions, selectedDate, onDateSelect, onSessionSelect, onEnterResult, onCancelSession }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getStatusColor = (status) => {
    switch (status) {
      case 'zavrsena': return 'bg-[#27AE60]';
      case 'zakazana': return 'bg-[#2D9CDB]';
      case 'otkazana': return 'bg-[#FF6B35]';
      default: return 'bg-[#B0B3C1]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'zavrsena': return 'Završena';
      case 'zakazana': return 'Zakazana';
      case 'otkazana': return 'Otkazana';
      default: return status;
    }
  };

  const getSessionsForDate = (date) => {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return sessions.filter(session => session.datum === dateString);
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('bs-BA', { 
      weekday: 'long', 
      day: 'numeric',
      month: 'long'
    });
  };

  // Generisanje dana u mjesecu
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Prazna polja za dane prije početka mjeseca
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Dani u mjesecu
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const todaySessions = getSessionsForDate(selectedDate);

  // Dodatne vožnje za bogatiji prikaz
  const additionalSessions = [
    {
      _id: 'mock_session_9',
      kandidat: { name: 'Adnan', surname: 'Karić', phone: '+38761122334' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date().toISOString().split('T')[0],
      vrijeme: '08:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Poligon Ilidža',
      napomene: 'Vježbe poligona',
      ocjena: null
    },
    {
      _id: 'mock_session_10',
      kandidat: { name: 'Lejla', surname: 'Hadžić', phone: '+38762233445' },
      instruktor: { name: 'Lejla', surname: 'Kovačević' },
      vozilo: { plate: 'SA-456-B' },
      datum: new Date().toISOString().split('T')[0],
      vrijeme: '10:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Centar grada',
      napomene: 'Gradska vožnja',
      ocjena: null
    },
    {
      _id: 'mock_session_11',
      kandidat: { name: 'Haris', surname: 'Delić', phone: '+38763344556' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date().toISOString().split('T')[0],
      vrijeme: '14:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Autoput',
      napomene: 'Vožnja na otvorenom putu',
      ocjena: null
    },
    {
      _id: 'mock_session_12',
      kandidat: { name: 'Amila', surname: 'Šarić', phone: '+38764455667' },
      instruktor: { name: 'Lejla', surname: 'Kovačević' },
      vozilo: { plate: 'SA-456-B' },
      datum: new Date().toISOString().split('T')[0],
      vrijeme: '16:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Testna staza',
      napomene: 'Priprema za ispit',
      ocjena: null
    },
    {
      _id: 'mock_session_13',
      kandidat: { name: 'Kenan', surname: 'Mujić', phone: '+38765566778' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      vrijeme: '09:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Poligon',
      napomene: 'Prva vožnja',
      ocjena: null
    },
    {
      _id: 'mock_session_14',
      kandidat: { name: 'Selma', surname: 'Hodžić', phone: '+38766677889' },
      instruktor: { name: 'Lejla', surname: 'Kovačević' },
      vozilo: { plate: 'SA-456-B' },
      datum: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      vrijeme: '11:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Gradska vožnja',
      napomene: 'Parkiranje',
      ocjena: null
    },
    {
      _id: 'mock_session_15',
      kandidat: { name: 'Dženan', surname: 'Kovačević', phone: '+38767788990' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      vrijeme: '15:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Autoput',
      napomene: 'Brzinska vožnja',
      ocjena: null
    },
    {
      _id: 'mock_session_16',
      kandidat: { name: 'Amina', surname: 'Husić', phone: '+38761123456' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      vrijeme: '08:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Poligon',
      napomene: 'Završna priprema',
      ocjena: null
    },
    {
      _id: 'mock_session_17',
      kandidat: { name: 'Dario', surname: 'Madić', phone: '+38762345678' },
      instruktor: { name: 'Lejla', surname: 'Kovačević' },
      vozilo: { plate: 'SA-456-B' },
      datum: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      vrijeme: '12:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Centar',
      napomene: 'Noćna vožnja',
      ocjena: null
    },
    {
      _id: 'mock_session_18',
      kandidat: { name: 'Adnan', surname: 'Karić', phone: '+38761122334' },
      instruktor: { name: 'Amir', surname: 'Hodžić' },
      vozilo: { plate: 'SA-123-A' },
      datum: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      vrijeme: '10:00',
      trajanje: 2,
      status: 'zakazana',
      lokacija: 'Testna staza',
      napomene: 'Ispitna vožnja',
      ocjena: null
    }
  ];

  // Kombinuj postojeće i dodatne vožnje
  const allSessions = [...sessions, ...additionalSessions];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kalendar */}
      <div className="lg:col-span-2 bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-xl border border-[#2A2D3A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {currentMonth.toLocaleDateString('bs-BA', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-[#B0B3C1] hover:text-white hover:border-[#6C63FF] transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-[#B0B3C1] hover:text-white hover:border-[#6C63FF] transition-colors text-sm"
            >
              Danas
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-[#B0B3C1] hover:text-white hover:border-[#6C63FF] transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[#B0B3C1] text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const daySessions = day ? getSessionsForDate(day.toISOString().split('T')[0]) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isSelected = day && day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                onClick={() => day && onDateSelect(day)}
                className={`min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                  !day 
                    ? 'border-transparent' 
                    : isSelected
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF]'
                    : isToday
                    ? 'bg-[#2D9CDB]/10 border-[#2D9CDB]/30'
                    : 'bg-[#232634] border-[#2A2D3A] hover:border-[#6C63FF]/40'
                }`}
              >
                {day && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${
                        isToday ? 'text-[#2D9CDB]' : isSelected ? 'text-white' : 'text-[#B0B3C1]'
                      }`}>
                        {day.getDate()}
                      </span>
                      {daySessions.length > 0 && (
                        <span className="bg-[#6C63FF] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {daySessions.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map(session => (
                        <div
                          key={session._id}
                          className={`text-xs p-1 rounded ${getStatusColor(session.status)} text-white truncate`}
                          title={`${session.vrijeme} - ${session.kandidat.name} ${session.kandidat.surname} - ${getStatusText(session.status)}`}
                        >
                          <div className="font-medium">{session.vrijeme}</div>
                          <div className="text-[10px] opacity-90">
                            {session.kandidat.name.charAt(0)}.{session.kandidat.surname.charAt(0)}
                          </div>
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <div className="text-xs text-[#B0B3C1] text-center bg-[#2A2D3A] py-1 rounded">
                          +{daySessions.length - 3} više
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalji za odabrani dan */}
      <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-xl border border-[#2A2D3A] p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          📅 Vožnje za {formatDate(selectedDate.toISOString().split('T')[0])}
        </h3>
        
        {todaySessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-[#B0B3C1]">Nema vožnji za odabrani dan</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {todaySessions.map(session => (
              <div
                key={session._id}
                className={`p-4 rounded-lg border-l-4 ${
                  session.status === 'zavrsena' ? 'border-l-[#27AE60] bg-[#27AE60]/10' :
                  session.status === 'zakazana' ? 'border-l-[#2D9CDB] bg-[#2D9CDB]/10' :
                  'border-l-[#FF6B35] bg-[#FF6B35]/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">
                      {session.vrijeme} • {session.trajanje}h
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'zavrsena' ? 'bg-[#27AE60] text-white' :
                      session.status === 'zakazana' ? 'bg-[#2D9CDB] text-white' :
                      'bg-[#FF6B35] text-white'
                    }`}>
                      {getStatusText(session.status)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {session.status === 'zakazana' && (
                      <>
                        <button
                          onClick={() => onEnterResult(session)}
                          className="bg-[#27AE60] text-white px-3 py-1 rounded text-sm hover:bg-[#219653] transition-colors font-medium"
                        >
                          Završi
                        </button>
                        <button
                          onClick={() => onCancelSession(session._id)}
                          className="bg-[#FF6B35] text-white px-3 py-1 rounded text-sm hover:bg-[#E55A2B] transition-colors font-medium"
                        >
                          Otkaži
                        </button>
                      </>
                    )}
                    {session.status === 'zavrsena' && session.ocjena && (
                      <span className="bg-[#6C63FF] text-white px-3 py-1 rounded text-sm font-medium">
                        ⭐ {session.ocjena}/10
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#B0B3C1]">Kandidat:</span>
                    <span className="text-white font-medium">
                      {session.kandidat.name} {session.kandidat.surname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B0B3C1]">Instruktor:</span>
                    <span className="text-white">
                      {session.instruktor.name} {session.instruktor.surname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B0B3C1]">Vozilo:</span>
                    <span className="text-white">{session.vozilo.plate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B0B3C1]">Lokacija:</span>
                    <span className="text-white">{session.lokacija}</span>
                  </div>
                </div>

                {session.napomene && (
                  <div className="mt-3 p-2 bg-[#2A2D3A] rounded text-sm">
                    <p className="text-[#B0B3C1] text-xs mb-1">Napomene:</p>
                    <p className="text-white">{session.napomene}</p>
                  </div>
                )}

                {session.status === 'zavrsena' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {session.potrosnjaGoriva && (
                      <div className="text-center bg-[#232634] rounded p-2">
                        <p className="text-[#B0B3C1]">Potrošnja</p>
                        <p className="text-white font-medium">{session.potrosnjaGoriva} L/100km</p>
                      </div>
                    )}
                    {session.predeniKilometri && (
                      <div className="text-center bg-[#232634] rounded p-2">
                        <p className="text-[#B0B3C1]">Kilometri</p>
                        <p className="text-white font-medium">{session.predeniKilometri} km</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Statistika dana */}
        {todaySessions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#2A2D3A]">
            <h4 className="text-sm font-medium text-[#B0B3C1] mb-2">Statistika dana:</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center bg-[#232634] rounded p-2">
                <p className="text-[#2D9CDB] font-bold">{todaySessions.filter(s => s.status === 'zakazana').length}</p>
                <p className="text-[#B0B3C1]">Zakazane</p>
              </div>
              <div className="text-center bg-[#232634] rounded p-2">
                <p className="text-[#27AE60] font-bold">{todaySessions.filter(s => s.status === 'zavrsena').length}</p>
                <p className="text-[#B0B3C1]">Završene</p>
              </div>
              <div className="text-center bg-[#232634] rounded p-2">
                <p className="text-[#FF6B35] font-bold">{todaySessions.filter(s => s.status === 'otkazana').length}</p>
                <p className="text-[#B0B3C1]">Otkazane</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrivingCalendar;