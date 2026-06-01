export const OFFER_LETTER_TEMPLATE = `
<div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <!-- Header Letterhead -->
  <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Fastigo X Technologies Inc.</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">882 Park Boulevard, Suite 100, San Francisco, CA 94103</p>
    </div>
    <div style="text-align: right;">
      <span style="background-color: #f5f3ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; border: 1px solid #ddd6fe; text-transform: uppercase; letter-spacing: 0.05em;">CONFIDENTIAL</span>
    </div>
  </div>

  <!-- Date & Subject -->
  <div style="margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #64748b;">Date: {{DATE}}</p>
    <p style="margin: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">To: {{CANDIDATE_NAME}}</p>
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">Email: {{CANDIDATE_EMAIL}}</p>
  </div>

  <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; border-left: 4px solid #4f46e5; padding-left: 12px; margin-bottom: 20px;">Subject: Offer of Employment - {{POSITION}}</h2>

  <!-- Body -->
  <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">Dear {{CANDIDATE_NAME}},</p>

  <p style="font-size: 14px; color: #334155; margin-bottom: 16px; text-align: justify;">
    On behalf of Fastigo X Technologies Inc., we are absolutely thrilled to offer you the position of <strong>{{POSITION}}</strong> within our <strong>{{DEPARTMENT}}</strong> team. We were incredibly impressed by your interviews, credentials, and technical capabilities, and we are confident that you will play a pivotal role in accelerating our engineering excellence.
  </p>

  <p style="font-size: 14px; color: #334155; margin-bottom: 16px; text-align: justify;">
    Please review the key terms of this offer details outlined below:
  </p>

  <!-- Terms Grid -->
  <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div>
      <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Designation / Role</span>
      <span style="font-size: 14px; font-weight: 700; color: #334155;">{{POSITION}}</span>
    </div>
    <div>
      <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Department</span>
      <span style="font-size: 14px; font-weight: 700; color: #334155;">{{DEPARTMENT}}</span>
    </div>
    <div>
      <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Annual Compensation (CTC)</span>
      <span style="font-size: 14px; font-weight: 700; color: #10b981;">₹{{SALARY}} Per Annum</span>
    </div>
    <div>
      <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block;">Proposed Date of Joining</span>
      <span style="font-size: 14px; font-weight: 700; color: #334155;">{{JOIN_DATE}}</span>
    </div>
  </div>

  <p style="font-size: 14px; color: #334155; margin-bottom: 20px; text-align: justify;">
    Your employment will be subject to the standard rules, guidelines, and values outlined in our Employee Code of Conduct. Upon joining, you will also be eligible for standard corporate benefits including comprehensive medical insurance, annual leave allowances, and performance-based incentives.
  </p>

  <p style="font-size: 14px; color: #334155; margin-bottom: 30px; text-align: justify;">
    To indicate your acceptance of this offer, please sign and return a scanned copy of this letter along with your required identity documents within five (5) business days.
  </p>

  <!-- Signatures -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; border-top: 1px solid #f1f5f9; pt-20">
    <div style="text-align: left;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #475569;">Sincerely,</p>
      <div style="font-family: 'Dancing Script', cursive, sans-serif; font-size: 22px; color: #4f46e5; margin: 10px 0;">Sarah Jenkins</div>
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">Sarah Jenkins</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Director of Human Resources</p>
      <p style="margin: 0; font-size: 10px; color: #94a3b8;">Fastigo X Technologies Inc.</p>
    </div>
    <div style="text-align: right; width: 220px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px;">
      <p style="margin: 0 0 45px 0; font-size: 12px; color: #94a3b8; font-weight: 600;">Candidate Signature & Date</p>
    </div>
  </div>
</div>
`;

export const APPOINTMENT_LETTER_TEMPLATE = `
<div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <!-- Header Letterhead -->
  <div style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Fastigo X Technologies Inc.</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">882 Park Boulevard, Suite 100, San Francisco, CA 94103</p>
    </div>
    <div style="text-align: right;">
      <span style="background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; border: 1px solid #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">OFFICIAL APPOINTMENT</span>
    </div>
  </div>

  <!-- Date & To -->
  <div style="margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #64748b;">Ref ID: WS/APT/{{EMP_ID}}</p>
    <p style="margin: 4px 0; font-size: 14px; font-weight: 600; color: #64748b;">Date: {{DATE}}</p>
    <p style="margin: 8px 0; font-size: 14px; font-weight: 700; color: #0f172a;">To: {{EMPLOYEE_NAME}}</p>
    <p style="margin: 0; font-size: 14px; color: #475569;">Emp ID: {{EMP_ID}}</p>
  </div>

  <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; border-left: 4px solid #0f172a; padding-left: 12px; margin-bottom: 20px;">LETTER OF APPOINTMENT</h2>

  <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">Dear {{EMPLOYEE_NAME}},</p>

  <p style="font-size: 14px; color: #334155; margin-bottom: 16px; text-align: justify;">
    We are pleased to formally appoint you as <strong>{{POSITION}}</strong> at Fastigo X Technologies Inc. with effect from your date of joining <strong>{{JOIN_DATE}}</strong>.
  </p>

  <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 10px;">1. Compensation & Remuneration</h3>
  <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; text-align: justify;">
    Your annual gross compensation is fixed at <strong>₹{{SALARY}} Per Annum</strong>, which will be paid in equal monthly installments subject to applicable income tax and provident fund deductions.
  </p>

  <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">2. Probationary Period</h3>
  <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0; text-align: justify;">
    You will be on probation for a period of six (6) months from your date of joining. Upon successful completion of your probation, your employment status will be confirmed in writing.
  </p>

  <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">3. Code of Conduct & Hours of Work</h3>
  <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; text-align: justify;">
    Your standard working hours are 9:00 AM to 6:00 PM, Monday through Friday. You are expected to adhere to all standard rules, safety procedures, and integrity policies enforced at the Fastigo X workplace.
  </p>

  <p style="font-size: 14px; color: #334155; margin-bottom: 40px;">
    Please sign the duplicate copy of this appointment letter to confirm your acceptance of the terms and conditions.
  </p>

  <!-- Signatures -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; border-top: 1px solid #f1f5f9; pt-20">
    <div style="text-align: left;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #475569;">For Fastigo X Technologies,</p>
      <div style="font-family: 'Dancing Script', cursive, sans-serif; font-size: 22px; color: #0f172a; margin: 10px 0;">Sarah Jenkins</div>
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">Sarah Jenkins</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Director of Human Resources</p>
    </div>
    <div style="text-align: right; width: 220px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px;">
      <p style="margin: 0 0 45px 0; font-size: 12px; color: #94a3b8; font-weight: 600;">Accepted (Employee Signature)</p>
    </div>
  </div>
</div>
`;

export const EXPERIENCE_LETTER_TEMPLATE = `
<div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b; line-height: 1.7; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <!-- Header Letterhead -->
  <div style="border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="color: #059669; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Fastigo X Technologies Inc.</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">882 Park Boulevard, Suite 100, San Francisco, CA 94103</p>
    </div>
    <div style="text-align: right;">
      <span style="background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em;">SERVICE EXPERIENCE</span>
    </div>
  </div>

  <!-- Reference and Date -->
  <div style="margin-bottom: 30px; display: flex; justify-content: space-between; text-align: left; font-size: 13px; color: #64748b; font-weight: 600;">
    <div>Ref: WS/CERT/{{EMP_ID}}</div>
    <div>Date: {{DATE}}</div>
  </div>

  <div style="text-align: center; margin-bottom: 35px;">
    <h2 style="font-size: 22px; font-weight: 850; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px double #cbd5e1; padding-bottom: 8px; display: inline-block;">TO WHOMSOEVER IT MAY CONCERN</h2>
  </div>

  <!-- Body -->
  <p style="font-size: 14.5px; color: #334155; margin-bottom: 20px; text-align: justify;">
    This is to certify that <strong>{{EMPLOYEE_NAME}}</strong> was an active employee of Fastigo X Technologies Inc. as a <strong>{{POSITION}}</strong> under the <strong>{{DEPARTMENT}}</strong> division for the period from <strong>{{JOIN_DATE}}</strong> to <strong>{{EXIT_DATE}}</strong>.
  </p>

  <p style="font-size: 14.5px; color: #334155; margin-bottom: 20px; text-align: justify;">
    During their tenure at Fastigo X, {{EMPLOYEE_NAME}} demonstrated outstanding diligence, exceptional problem-solving abilities, and a collaborative team spirit. They were instrumental in leading high-impact initiatives and consistently maintained a stellar record of technical contribution and integrity.
  </p>

  <p style="font-size: 14.5px; color: #334155; margin-bottom: 40px; text-align: justify;">
    We appreciate their valuable services and contributions to the company. We part ways with mutual respect and sincerely wish them the very best in all their future endeavors and career opportunities.
  </p>

  <!-- Signatures -->
  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; border-top: 1px solid #f1f5f9; pt-20">
    <div style="text-align: left;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #475569;">For Fastigo X Technologies Inc.,</p>
      <div style="font-family: 'Dancing Script', cursive, sans-serif; font-size: 22px; color: #059669; margin: 10px 0;">Sarah Jenkins</div>
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">Sarah Jenkins</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600;">Director of Human Resources</p>
    </div>
    <div style="text-align: right;">
      <div style="border: 2px solid #a7f3d0; border-radius: 50%; width: 85px; height: 85px; display: flex; flex-col: column; align-items: center; justify-content: center; font-size: 9px; color: #059669; font-weight: 800; text-transform: uppercase; background-color: #ecfdf5; transform: rotate(-10deg);">
        <span>WS Corp</span>
        <span style="font-size: 7px; border-top: 1px solid #a7f3d0; padding-top: 2px; margin-top: 2px;">Official Seal</span>
      </div>
    </div>
  </div>
</div>
`;
