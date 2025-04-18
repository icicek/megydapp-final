export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  export default async function handler(req, res) {
    console.log("✅ Test API çalışıyor - image generation devre dışı");
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send("✅ Test: image generation API is alive and responding.");
  }
  