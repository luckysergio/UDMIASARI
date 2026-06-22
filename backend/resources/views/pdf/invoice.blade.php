{{-- resources/views/pdf/invoice.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoiceNo }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', Courier, monospace;
            padding: 40px;
            color: #333;
            font-size: 12px;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header-left { flex: 1; }
        .header-center { flex: 2; text-align: center; }
        .header-center h1 { font-size: 20px; margin-bottom: 5px; }
        .header-center p { font-size: 11px; color: #666; line-height: 1.4; }
        .header-right { flex: 1; text-align: right; }
        .invoice-number {
            font-size: 12px;
            font-weight: bold;
            background: #f5f5f5;
            padding: 6px 12px;
            border-radius: 6px;
            display: inline-block;
        }
        .invoice-title { text-align: center; margin: 20px 0; }
        .invoice-title h2 {
            font-size: 20px;
            border-bottom: 1px solid #333;
            display: inline-block;
            padding-bottom: 5px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
        }
        .info-box {
            border: 1px solid #ddd;
            padding: 10px;
            width: 48%;
        }
        .info-box p { margin: 5px 0; }
        .info-box strong { font-weight: bold; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th { background-color: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { margin-top: 20px; text-align: right; }
        .totals table { width: 300px; margin-left: auto; }
        .totals td { border: none; padding: 5px; }
        .grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 11px;
            color: #666;
        }
        .payment-info {
            margin-top: 20px;
            padding: 15px;
            background: #ecfdf5;
            border-radius: 8px;
            border: 1px solid #a7f3d0;
        }
        .payment-info h4 {
            margin: 0 0 10px;
            color: #065f46;
            font-size: 14px;
        }
        .payment-info .bank-detail {
            font-size: 12px;
            padding: 3px 0;
        }
        .payment-info .bank-detail strong {
            color: #065f46;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-left">
                <img src="{{ public_path('storage/images/logo.png') }}" alt="Logo" style="width:80px;height:auto;">
            </div>
            <div class="header-center">
                <h1>UD MIA SARI</h1>
                <p>Jl. Cut Nyak Dien, Kedaung Bar., Kec. Sepatan Tim., Kabupaten Tangerang, Banten 15520</p>
                <p>Telp: +62 85886682496 | Email: baksomiasari@gmail.com</p>
            </div>
            <div class="header-right">
                <div class="invoice-number">{{ $invoiceNo }}</div>
            </div>
        </div>
        
        <div class="invoice-title">
            <h2>INVOICE</h2>
        </div>
        
        <div class="info-section">
            <div class="info-box">
                <p><strong>TANGGAL:</strong> {{ $createdAt->format('d/m/Y H:i') }}</p>
                <p><strong>STATUS:</strong> {{ ucfirst($transaction->status) }}</p>
            </div>
            <div class="info-box">
                <p><strong>CUSTOMER:</strong> {{ $customerName }}</p>
                <p><strong>TELEPON:</strong> {{ $transaction->customer_phone ?? '-' }}</p>
            </div>
        </div>
        
        @if($deliveryType)
        <div class="info-section">
            <div class="info-box" style="width:100%;">
                <p><strong>PENGIRIMAN:</strong> {{ $deliveryType === 'delivery' ? 'Dikirim' : 'Ambil Sendiri' }}</p>
                @if($deliveryAddress)
                <p><strong>ALAMAT:</strong> {{ $deliveryAddress }}</p>
                @endif
            </div>
        </div>
        @endif
        
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Produk</th>
                    <th>Kode</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Harga</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($details as $index => $detail)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $detail->product->name ?? '-' }}</td>
                    <td>{{ $detail->product->code ?? '-' }}</td>
                    <td class="text-center">{{ $detail->qty }}</td>
                    <td class="text-right">Rp {{ number_format($detail->price, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($detail->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <div class="totals">
            <table>
                <tr>
                    <td width="70%">Subtotal:</td>
                    <td class="text-right">Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</td>
                </tr>
                @if($transaction->discount > 0)
                <tr>
                    <td>Diskon:</td>
                    <td class="text-right">-Rp {{ number_format($transaction->discount, 0, ',', '.') }}</td>
                </tr>
                @endif
                @if($transaction->tax > 0)
                <tr>
                    <td>Pajak:</td>
                    <td class="text-right">+Rp {{ number_format($transaction->tax, 0, ',', '.') }}</td>
                </tr>
                @endif
                <tr class="grand-total">
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right"><strong>Rp {{ number_format($grandTotal, 0, ',', '.') }}</strong></td>
                </tr>
            </table>
        </div>
        
        <div class="payment-info">
            <h4>💳 Informasi Pembayaran</h4>
            <div class="bank-detail"><strong>Bank:</strong> BCA</div>
            <div class="bank-detail"><strong>Nomor Rekening:</strong> 1082503506</div>
            <div class="bank-detail"><strong>Atas Nama:</strong> Muhamad Alfarel Julianto</div>
            <div style="margin-top:8px;font-weight:600;color:#065f46;">
                Total yang harus dibayar: Rp {{ number_format($grandTotal, 0, ',', '.') }}
            </div>
        </div>
        
        <div class="footer">
            <p>Terima kasih atas pembelian Anda!</p>
            <p>Invoice dicetak pada: {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>
</body>
</html>