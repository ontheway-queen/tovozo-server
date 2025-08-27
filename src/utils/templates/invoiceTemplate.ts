export const hotelierInvoiceTemplate = (params: {
	authorize: string;
	to: string;
	address: string;
	invoice_no: string;
	date: string;
	amount: number;
	customer?: string;
}) => {
	return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tovozo Invoice - ${params.invoice_no}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            padding: 30px 40px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: #2c3e50;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
        }
        
        .company-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .company-details {
            text-align: right;
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .invoice-title {
            text-align: center;
            margin: 30px 0;
        }
        
        .invoice-badge {
            display: inline-block;
            padding: 8px 20px;
            border: 2px solid #2c3e50;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .invoice-body {
            padding: 0 40px 40px 40px;
        }
        
        .client-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .invoice-to {
            flex: 1;
        }
        
        .invoice-meta {
            text-align: right;
            min-width: 200px;
        }
        
        .section-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 0.95rem;
            margin-bottom: 8px;
        }
        
        .client-name {
            font-size: 1.1rem;
            color: #333;
            font-weight: 500;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.95rem;
        }
        
        .meta-label {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 1px solid #e0e0e0;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            color: #2c3e50;
            padding: 12px 15px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .items-table th:last-child {
            text-align: right;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
        }
        
        .items-table td:last-child {
            text-align: right;
            font-weight: 500;
        }
        
        .total-row {
            background-color: #f8f9fa;
        }
        
        .total-row td {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .signature-section {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            align-items: end;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            margin-bottom: 8px;
            height: 50px;
            display: flex;
            align-items: end;
        }
        
        .signature-label {
            font-size: 0.9rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .footer-note {
            text-align: center;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.4;
        }
        
        @media (max-width: 768px) {
            .invoice-container {
                margin: 10px;
            }
            
            .invoice-header, .invoice-body {
                padding: 20px;
            }
            
            .header-top {
                flex-direction: column;
                gap: 20px;
            }
            
            .company-details {
                text-align: left;
            }
            
            .client-info {
                flex-direction: column;
                gap: 20px;
            }
            
            .invoice-meta {
                text-align: left;
            }
            
            .signature-section {
                grid-template-columns: 1fr;
                gap: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo">T</div>
                    <div class="company-name">Tovozo</div>
                </div>
                
                <div class="company-details">
                    ${params.address}<br>
                    admin@tovozo.com
                </div>
            </div>
            
            <div class="invoice-title">
                <span class="invoice-badge">Invoice</span>
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="client-info">
                <div class="invoice-to">
                    <div class="section-label">Invoice To:</div>
                    <div class="client-name">${params.to}</div>
                </div>
                
                <div class="invoice-meta">
                    <div class="meta-row">
                        <span class="meta-label">Invoice No:</span>
                        <span>${params.invoice_no}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Date:</span>
                        <span>${new Date()}</span>
                    </div>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Amount</td>
                        <td>${params.amount}</td>
                    </tr>
                    <tr>
                        <td>Paid Amount</td>
                        <td>${params.amount}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Amount</td>
                        <td>0.00</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div>${params.customer}</div>
                    <div class="signature-line"></div>
                    <div class="signature-label">Customer Signature</div>
                </div>
                
                <div class="footer-note">
                    This is Software Generated Bill.<br>
                    TOVOZO Developed By: M360 ICT
                </div>
                
                <div class="signature-box">
                    <div>tovozo</div>
                    <div class="signature-line"></div>
                    <div class="signature-label">Authorized Signature</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export const jobSeekerInvoiceTemplate = (params: {
	authorize: string;
	to: string;
	address: string;
	invoice_no: string;
	date: string;
	amount: number;
	customer?: string;
}) => {
	return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tovozo Invoice - ${params.invoice_no}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .invoice-header {
            padding: 30px 40px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: #2c3e50;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
        }
        
        .company-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .company-details {
            text-align: right;
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .invoice-title {
            text-align: center;
            margin: 30px 0;
        }
        
        .invoice-badge {
            display: inline-block;
            padding: 8px 20px;
            border: 2px solid #2c3e50;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .invoice-body {
            padding: 0 40px 40px 40px;
        }
        
        .client-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .invoice-to {
            flex: 1;
        }
        
        .invoice-meta {
            text-align: right;
            min-width: 200px;
        }
        
        .section-label {
            font-weight: bold;
            color: #2c3e50;
            font-size: 0.95rem;
            margin-bottom: 8px;
        }
        
        .client-name {
            font-size: 1.1rem;
            color: #333;
            font-weight: 500;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.95rem;
        }
        
        .meta-label {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 1px solid #e0e0e0;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            color: #2c3e50;
            padding: 12px 15px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .items-table th:last-child {
            text-align: right;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
        }
        
        .items-table td:last-child {
            text-align: right;
            font-weight: 500;
        }
        
        .total-row {
            background-color: #f8f9fa;
        }
        
        .total-row td {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .signature-section {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            align-items: end;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 2px solid #333;
            margin-bottom: 8px;
            height: 50px;
            display: flex;
            align-items: end;
        }
        
        .signature-label {
            font-size: 0.9rem;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .footer-note {
            text-align: center;
            font-size: 0.85rem;
            color: #666;
            line-height: 1.4;
        }
        
        @media (max-width: 768px) {
            .invoice-container {
                margin: 10px;
            }
            
            .invoice-header, .invoice-body {
                padding: 20px;
            }
            
            .header-top {
                flex-direction: column;
                gap: 20px;
            }
            
            .company-details {
                text-align: left;
            }
            
            .client-info {
                flex-direction: column;
                gap: 20px;
            }
            
            .invoice-meta {
                text-align: left;
            }
            
            .signature-section {
                grid-template-columns: 1fr;
                gap: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="header-top">
                <div class="logo-section">
                    <div class="logo">T</div>
                    <div class="company-name">Tovozo</div>
                </div>
                
                <div class="company-details">
                    ${params.address}<br>
                    admin@tovozo.com
                </div>
            </div>
            
            <div class="invoice-title">
                <span class="invoice-badge">Invoice</span>
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="client-info">
                <div class="invoice-to">
                    <div class="section-label">Invoice To:</div>
                    <div class="client-name">${params.to}</div>
                </div>
                
                <div class="invoice-meta">
                    <div class="meta-row">
                        <span class="meta-label">Invoice No:</span>
                        <span>${params.invoice_no}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Date:</span>
                        <span>${new Date()}</span>
                    </div>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Amount</td>
                        <td>${params.amount}</td>
                    </tr>
                    <tr>
                        <td>Paid Amount</td>
                        <td>${params.amount}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Amount</td>
                        <td>0.00</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div>${params.customer}</div>
                    <div class="signature-line"></div>
                    <div class="signature-label">Customer Signature</div>
                </div>
                
                <div class="footer-note">
                    This is Software Generated Bill.<br>
                    TOVOZO Developed By: M360 ICT
                </div>
                
                <div class="signature-box">
                    <div>tovozo</div>
                    <div class="signature-line"></div>
                    <div class="signature-label">Authorized Signature</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
