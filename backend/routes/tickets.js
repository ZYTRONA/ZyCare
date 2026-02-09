const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const axios = require('axios');

// POST /api/tickets/create
router.post('/create', async (req, res) => {
  try {
    const { patientId, symptoms } = req.body;

    if (!patientId || !symptoms) {
      return res.status(400).json({ error: 'Patient ID and symptoms are required' });
    }

    // Call AI Engine for analysis
    const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/analyze`, {
      text: symptoms
    });

    const aiAnalysis = aiResponse.data;

    // Create ticket
    const ticket = new Ticket({
      patientId,
      symptoms,
      ai_analysis: {
        severity: aiAnalysis.severity,
        score: aiAnalysis.score,
        summary: aiAnalysis.summary,
        recommended_action: aiAnalysis.recommended_action
      },
      status: 'queued'
    });

    await ticket.save();

    // Populate patient info
    await ticket.populate('patientId', 'name phone');

    res.json({
      ticketId: ticket._id,
      status: ticket.status,
      ai_analysis: ticket.ai_analysis
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET /api/tickets/queue
router.get('/queue', async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'queued' })
      .populate('patientId', 'name phone')
      .sort({ 'ai_analysis.score': -1, createdAt: 1 });

    const formattedTickets = tickets.map(ticket => ({
      ticketId: ticket._id,
      patientName: ticket.patientId.name,
      patientPhone: ticket.patientId.phone,
      symptoms: ticket.symptoms,
      severity: ticket.ai_analysis.severity,
      score: ticket.ai_analysis.score,
      aiSummary: ticket.ai_analysis.summary,
      recommendedAction: ticket.ai_analysis.recommended_action,
      createdAt: ticket.createdAt
    }));

    res.json(formattedTickets);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tickets/:ticketId
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate('patientId', 'name phone language');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/tickets/:ticketId/status
router.patch('/:ticketId/status', async (req, res) => {
  try {
    const { status, doctorId, doctorNotes } = req.body;

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (doctorId) ticket.doctorId = doctorId;
    if (doctorNotes) ticket.doctorNotes = doctorNotes;

    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
