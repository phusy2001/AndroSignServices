const template = (subject: string, content: string) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template for AndroSign App</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }

      .container {
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        font-size: 24px;
        margin-top: 0;
      }

      p {
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
      }

      button {
        background-color: #4caf50;
        border: none;
        color: white;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      }

      .banner {
        text-align: center;
        border-bottom: 1px solid #ccc;
      }

      .banner img {
        max-width: 100%;
        height: auto;
      }

      .footer {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ccc;
        font-size: 12px;
        text-align: center;
      }

      .footer p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="banner">
        <h1>Ứng dụng ký kết văn bản trực tuyến</h1>
        <a href="https://iili.io/HQflnPS.md.png"
          ><img
            src="https://iili.io/HQflnPS.md.png"
            alt="AndroSignLogo"
            style="width: 220px; margin-top: -60px"
        /></a>
      </div>
      <h2>${subject}</h2>
      <p>
        ${content}
      </p>
      <div class="footer">
        <p>AndroSign - Hệ thống ký kết văn bản trực tuyến</p>
        <p>HCMUS © 2023. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
};

export default template;
