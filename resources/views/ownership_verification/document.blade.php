<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <title>Poizvedba — {{ $refNum }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            color: #000;
            background: #fff;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm 25mm 20mm 30mm;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .header-org {
            font-size: 10pt;
            line-height: 1.4;
        }

        .header-org strong {
            font-size: 12pt;
            display: block;
        }

        .header-ref {
            font-size: 10pt;
            text-align: right;
        }

        h1 {
            font-size: 14pt;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 24px 0 20px;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
        }

        .section {
            margin-bottom: 18px;
        }

        .section-title {
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 3px;
            margin-bottom: 8px;
        }

        .data-row {
            display: flex;
            gap: 8px;
            padding: 2px 0;
            font-size: 11pt;
        }

        .data-label {
            width: 140px;
            color: #555;
            font-size: 10pt;
            flex-shrink: 0;
        }

        .statement {
            border: 1px solid #000;
            padding: 14px 16px;
            margin: 24px 0;
            font-size: 11pt;
            line-height: 1.6;
            background: #fafafa;
        }

        .no-aircraft-box {
            border: 2px solid #000;
            padding: 16px;
            margin: 24px 0;
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            gap: 40px;
        }

        .signature-block {
            flex: 1;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 4px;
            font-size: 10pt;
        }

        .footer {
            border-top: 1px solid #ccc;
            margin-top: 30px;
            padding-top: 8px;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }

        @media print {
            body { margin: 0; }
            .page { padding: 15mm 20mm 15mm 25mm; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body onload="window.print()">

<!-- Print button (hidden on print) -->
<div class="no-print" style="position:fixed;top:10px;right:10px;z-index:99;">
    <button onclick="window.print()"
        style="padding:8px 16px;background:#003580;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
        Natisni / Shrani PDF
    </button>
</div>

<div class="page">

    <!-- Header -->
    <div class="header">
        <div class="header-org">
            <strong>Republika Slovenija</strong>
            Javna agencija za civilno letalstvo<br>
            Letalska ulica 4, 1000 Ljubljana
        </div>
        <div class="header-ref">
            <strong>Št.: {{ $refNum }}</strong><br>
            Datum: {{ $date }}
        </div>
    </div>

    <h1>Potrdilo o lastništvu zrakoplova</h1>

    <!-- Applicant -->
    <div class="section">
        <div class="section-title">Vlagatelj</div>
        <div class="data-row">
            <span class="data-label">Naziv / Ime:</span>
            <span><strong>{{ $applicant['name'] ?? '—' }}</strong></span>
        </div>
        <div class="data-row">
            <span class="data-label">Naslov:</span>
            <span>{{ $applicant['address'] ?? '' }}, {{ $applicant['postNum'] ?? '' }} {{ $applicant['postOffice'] ?? '' }}</span>
        </div>
        @if (!empty($applicant['tax']))
        <div class="data-row">
            <span class="data-label">Davčna številka:</span>
            <span>{{ $applicant['tax'] }}</span>
        </div>
        @endif
        @if (!empty($applicant['legal']))
        <div class="data-row">
            <span class="data-label">Pravna podlaga:</span>
            <span>{{ $applicant['legal'] }}</span>
        </div>
        @endif
    </div>

    <!-- Subject -->
    <div class="section">
        <div class="section-title">Poizvedenec</div>
        <div class="data-row">
            <span class="data-label">Naziv / Ime:</span>
            <span><strong>{{ $subject['display_name'] ?? '—' }}</strong></span>
        </div>
        @if (!empty($subject['address']))
        <div class="data-row">
            <span class="data-label">Naslov:</span>
            <span>{{ $subject['address'] }}, {{ $subject['zip_code'] ?? '' }} {{ $subject['city'] ?? '' }}</span>
        </div>
        @endif
        @if (!empty($subject['tax']))
        <div class="data-row">
            <span class="data-label">Davčna številka:</span>
            <span>{{ $subject['tax'] }}</span>
        </div>
        @endif
    </div>

    <!-- Statement / No aircraft box -->
    <div class="no-aircraft-box">
        V REGISTRU ZRAKOPLOVOV NI EVIDENTIRANEGA<br>
        NOBENEGA ZRAKOPLOVA V LASTI POIZVEDENCA
    </div>

    <div class="statement">
        Na podlagi podatkov, ki jih vodi Republika Slovenija — Javna agencija za civilno letalstvo
        v Registru zrakoplovov, se potrjuje, da za zgoraj navedeno osebo oziroma subjekt
        <strong>{{ $subject['display_name'] ?? '' }}</strong> v registru zrakoplovov
        ni evidentiranega nobenega zrakoplova v aktivnem lastništvu ali upravljanju.
    </div>

    <!-- Signatures -->
    <div class="signatures">
        <div class="signature-block">
            <div class="signature-line">Odgovorna oseba</div>
        </div>
        <div class="signature-block">
            <div class="signature-line">Žig / Podpis</div>
        </div>
    </div>

    <div class="footer">
        Dokument je bil generiran elektronsko prek portala CAA Register dne {{ $date }}.
        Referenčna številka: {{ $refNum }}
    </div>

</div>
</body>
</html>
