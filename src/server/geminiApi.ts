import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from '@google/genai';
import express from 'express';

const router = express.Router();

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. High Thinking Portfolio & Strategy Advisor
// Model: gemini-3.1-pro-preview, thinkingLevel: HIGH, do not set maxOutputTokens
router.post('/ai/analyze-portfolio', async (req, res) => {
  try {
    const { prompt, portfolioData, queryType } = req.body;
    const ai = getAiClient();

    const systemPrompt = `You are the Prism Wallet Senior Crypto & Quantitative Portfolio Strategist.
You provide institutional-grade analysis for crypto portfolios, risk mitigation, chain rebalancing, yield opportunities, and smart contract security.
Always deliver deeply reasoned, actionable, mathematical, and protective financial intelligence.
Format your output cleanly in markdown with structured sections:
1. Executive Risk & Health Assessment (Score 1-100)
2. In-Depth Multi-Chain Allocation Audit
3. Strategic Rebalancing Recommendations (Clear actions: BUY/SELL/HOLD with percentages)
4. Macro Market & Liquidity Dynamics
5. Actionable Security & Cold-Storage Directives.`;

    const fullContent = `${systemPrompt}\n\nPortfolio Overview:\n${JSON.stringify(portfolioData, null, 2)}\n\nUser Question/Focus:\n${prompt || 'Provide a complete institutional portfolio risk & optimization review.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: fullContent,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    const text = response.text || 'Unable to generate analysis at this time.';
    res.json({ success: true, text });
  } catch (error: any) {
    console.error('Error in analyze-portfolio:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to complete high-thinking analysis.' 
    });
  }
});

// 2. High-Quality Image Generation (Web3 VIP Cards, Hardware Skins, NFT Tokens)
// Model: gemini-3-pro-image-preview with imageSize (1K, 2K, 4K)
router.post('/ai/generate-card-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '16:9' } = req.body;
    const ai = getAiClient();

    // Verify valid image sizes: '1K', '2K', '4K'
    const validSize = ['1K', '2K', '4K'].includes(imageSize) ? imageSize : '1K';
    const validRatio = ['1:1', '16:9', '9:16', '3:4', '4:3'].includes(aspectRatio) ? aspectRatio : '16:9';

    const enhancedPrompt = `High-end futuristic luxury crypto hardware wallet card design, titanium holographic prism texture, sleek typography, cybernetic neon accents: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: validRatio as any,
          imageSize: validSize as any,
        }
      }
    });

    let imageUrl = '';
    let textExplanation = '';

    const candidates = response.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textExplanation += part.text;
        }
      }
    }

    if (!imageUrl) {
      // Fallback check
      return res.status(400).json({ 
        success: false, 
        error: 'No image data returned from image preview model.' 
      });
    }

    res.json({ success: true, imageUrl, description: textExplanation, imageSize: validSize });
  } catch (error: any) {
    console.error('Error in generate-card-image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate high-resolution image.' 
    });
  }
});

// 3. Animate Images into Video with Veo
// Model: veo-3.1-fast-generate-preview, aspect ratio 16:9 or 9:16
router.post('/ai/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '16:9' } = req.body;
    const ai = getAiClient();

    const validRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const cleanBase64 = imageBase64?.replace(/^data:image\/\w+;base64,/, '');

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this crypto card with dynamic holographic lighting, glowing particle stream, and subtle cybernetic rotation',
      image: cleanBase64 ? {
        imageBytes: cleanBase64,
        mimeType: mimeType || 'image/png',
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validRatio,
      }
    });

    res.json({ success: true, operationName: operation.name });
  } catch (error: any) {
    console.error('Error in generate-video:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to initiate Veo video generation.' 
    });
  }
});

// Poll Veo video status
router.post('/ai/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }
    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({ 
      success: true, 
      done: updated.done, 
      error: updated.error 
    });
  } catch (error: any) {
    console.error('Error in video-status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to query video operation.' 
    });
  }
});

// Download/stream generated video
router.post('/ai/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found on completed operation' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || '' }
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to stream video bytes from Gemini backend' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error in video-download:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to download video.' 
    });
  }
});

export default router;
