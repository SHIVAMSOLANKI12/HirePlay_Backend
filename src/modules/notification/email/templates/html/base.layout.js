export const BASE_HTML_LAYOUT = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f7f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #4F46E5;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px;
      color: #374151;
      line-height: 1.6;
    }
    .footer {
      background-color: #f9fafb;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{CompanyName}}</h1>
    </div>
    <div class="content">
      {{BodyContent}}
    </div>
    <div class="footer">
      &copy; {{Year}} {{CompanyName}}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
