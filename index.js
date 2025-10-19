const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// 健康檢查
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'NewebPay Encryption Service',
    timestamp: new Date().toISOString()
  });
});

// 藍新金流加密端點
app.post('/encrypt', (req, res) => {
  try {
    const { tradeData, hashKey, hashIV } = req.body;
    
    if (!tradeData || !hashKey || !hashIV) {
      return res.status(400).json({
        success: false,
        error: '缺少必要參數: tradeData, hashKey, hashIV'
      });
    }

    // AES-256-CBC 加密
    const cipher = crypto.createCipheriv('aes-256-cbc', 
      Buffer.from(hashKey, 'utf8'), 
      Buffer.from(hashIV, 'utf8')
    );
    
    let encrypted = cipher.update(tradeData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 生成 TradeSha
    const sha256Data = `HashKey=${hashKey}&${encrypted}&HashIV=${hashIV}`;
    const tradeSha = crypto.createHash('sha256')
      .update(sha256Data, 'utf8')
      .digest('hex')
      .toUpperCase();

    res.json({
      success: true,
      tradeInfo: encrypted,
      tradeSha: tradeSha
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`NewebPay Encryption Service running on port ${PORT}`);
});
