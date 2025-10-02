const PDFDocument = require('pdfkit');
const fs = require('fs');
const User = require('../models/User');
const DrivingSession = require('../models/DrivingSession');

// Generisanje naloga za instruktora za određeni datum
const generateInstructorSheet = async (req, res) => {
  try {
    const instructorId = req.user._id; // prijavljeni instruktor
    const { datum } = req.query; // datum u formatu YYYY-MM-DD

    if (!datum) return res.status(400).json({ message: 'Datum je obavezan' });

    // Dohvati sve vožnje za taj datum za instruktora
    const sessions = await DrivingSession.find({ termin: datum, instruktor: instructorId })
      .populate('user')
      .sort({ 'user.kandidat': 1 }) // po imenu kandidata
      .limit(10); // max 10 po zakonu

    // Kreiraj PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
    const fileName = `nalog_voznje_${datum}.pdf`;
    doc.pipe(fs.createWriteStream(fileName));

    // Naslov
    doc.fontSize(20).text('AUTOŠKOLA – EVIDENCIJA ČASOVA VOŽNJE', { align: 'center' }).moveDown(1.5);

    // Polja instruktora
    doc.fontSize(12);
    doc.text(`Autoškola: ${req.user.autoSkola || '________________'}`, 50, doc.y);
    doc.text(`Instruktor: ${req.user.name || '________________'}`, 50, doc.y + 20);

    // Napravi tabelu sa kandidatima
    const tableTop = doc.y + 40;
    const tableLeft = 40;
    const rowHeight = 25;
    const colWidths = [40, 80, 80, 80, 100, 150, 150];
    const headers = ['Čas', 'Datum', 'Početak', 'Završetak', 'Trajanje (min)', 'Potpis instruktora', 'Potpis kandidata'];

    // Header tabele
    let x = tableLeft;
    headers.forEach((header, i) => {
      doc.rect(x, tableTop, colWidths[i], rowHeight).stroke();
      doc.text(header, x + 5, tableTop + 7, { width: colWidths[i] - 10, align: 'center' });
      x += colWidths[i];
    });

    // Popuni redove sa kandidatima
    sessions.forEach((session, i) => {
      x = tableLeft;
      const y = tableTop + rowHeight * (i + 1);
      const user = session.user;
      const values = [
        i + 1,
        datum,
        session.pocetak || '',
        session.kraj || '',
        session.trajanje || '',
        '', // potpis instruktora
        `${user.kandidat || ''} / ${user.jmbg || ''}`
      ];

      values.forEach((val, j) => {
        doc.rect(x, y, colWidths[j], rowHeight).stroke();
        doc.text(val, x + 5, y + 7, { width: colWidths[j] - 10, align: 'center' });
        x += colWidths[j];
      });
    });

    // Napomene i pečat
    const notesY = tableTop + rowHeight * 12;
    doc.text('Napomena instruktora: ________________________________________________', tableLeft, notesY);
    doc.text('Potpis instruktora: ____________________    Pečat autoškole: ____________', tableLeft, notesY + 30);

    doc.end();

    res.json({ message: 'PDF generisan', fileName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { generateInstructorSheet };
