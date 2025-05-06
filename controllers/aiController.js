// controllers/aiController.js
const axios = require('axios');

const suggestDiagnosis = async (req, res) => {
  const { results } = req.body;

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/digitalhealth-healthyliving/MediFlow',
      {
        inputs: results
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const suggestion = response.data;
    res.status(200).json({ suggestion });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Error al obtener sugerencia de diagnóstico' });
  }
};

module.exports = { suggestDiagnosis };
