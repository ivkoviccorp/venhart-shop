const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Venhart Concept Store <orders@venhartstore.rs>';

// Email kupcu - porudžbina primljena
exports.sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(item =>
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.size || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toLocaleString()} RSD</td>
    </tr>`
  ).join('');

  const deliveryText = order.deliveryMethod === 'pickup'
    ? 'Preuzimanje u butiku'
    : `Dostava na adresu: ${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}`;

  const html = `
    <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <div style="background: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: #d4a574; margin: 0; font-size: 28px; letter-spacing: 3px;">VENHART</h1>
        <p style="color: #888; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">CONCEPT STORE</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #1a1a1a;">Hvala na porudžbini! 🛍️</h2>
        <p>Poštovani/a ${order.customer.firstName},</p>
        <p>Vaša porudžbina <strong>#${order.orderNumber}</strong> je uspešno primljena i čeka odobrenje.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 10px; text-align: left;">Artikal</th>
              <th style="padding: 10px; text-align: left;">Veličina</th>
              <th style="padding: 10px; text-align: left;">Kom.</th>
              <th style="padding: 10px; text-align: left;">Cena</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>

        ${order.shippingCost > 0 ? `<p>Dostava: <strong>${order.shippingCost.toLocaleString()} RSD</strong></p>` : ''}
        <p style="font-size: 18px; color: #1a1a1a;"><strong>Ukupno: ${order.totalAmount.toLocaleString()} RSD</strong></p>

        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Način preuzimanja:</strong> ${deliveryText}</p>
        </div>

        <p>Obavestićemo Vas emailom kada porudžbina bude odobrena.</p>
        <p style="color: #888;">Srdačno,<br>Venhart Concept Store</p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Venhart Concept Store</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Potvrda porudžbine #${order.orderNumber} - Venhart`,
    html
  });
};

// Email adminu - nova porudžbina
exports.sendAdminNotification = async (order) => {
  const itemsList = order.items.map(item =>
    `• ${item.name} (Vel: ${item.size || '-'}, Kom: ${item.quantity}) - ${item.price.toLocaleString()} RSD`
  ).join('\n');

  const html = `
    <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #d4a574; margin: 0;">VENHART ADMIN</h1>
      </div>
      <div style="padding: 20px; background: #fff;">
        <h2>🔔 Nova porudžbina #${order.orderNumber}</h2>
        <p><strong>Kupac:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Telefon:</strong> ${order.customer.phone}</p>
        <p><strong>Način:</strong> ${order.deliveryMethod === 'pickup' ? 'Preuzimanje u butiku' : 'Dostava'}</p>
        ${order.deliveryMethod === 'delivery' ? `<p><strong>Adresa:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}</p>` : ''}
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${itemsList}</pre>
        <p style="font-size: 20px;"><strong>Ukupno: ${order.totalAmount.toLocaleString()} RSD</strong></p>
        <a href="${process.env.CLIENT_URL}/admin/orders" style="display: inline-block; background: #d4a574; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Pogledaj porudžbinu</a>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 Nova porudžbina #${order.orderNumber}`,
    html
  });
};

// Email kupcu - porudžbina prihvaćena
exports.sendOrderAccepted = async (order) => {
  const deliveryInfo = order.deliveryMethod === 'pickup'
    ? `<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1a1a1a;">📍 Preuzimanje u butiku</h3>
        <p style="margin: 10px 0;"><strong>Adresa:</strong> Generala Ljubomira Milića 1, Beograd 11000</p>
        <p style="margin: 10px 0;"><strong>Radno vreme:</strong> Ponedeljak - Subota: 10:00 - 20:00</p>
        <p style="margin: 10px 0;"><strong>Telefon:</strong> 063 755 5245</p>
        <p style="margin: 10px 0; color: #666; font-style: italic;">Molimo Vas da porudžbinu preuzmete u roku od 7 dana.</p>
      </div>`
    : `<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1a1a1a;">🚚 Dostava na adresu</h3>
        <p style="margin: 10px 0;">Vaša porudžbina će biti poslata na adresu koju ste naveli.</p>
        <p style="margin: 10px 0;"><strong>Očekivana isporuka:</strong> 2-4 radna dana</p>
        <p style="margin: 10px 0; color: #666; font-style: italic;">Bićete kontaktirani pre isporuke.</p>
      </div>`;

  const html = `
    <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: #d4a574; margin: 0; letter-spacing: 3px;">VENHART</h1>
        <p style="color: #888; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">CONCEPT STORE</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #27ae60; margin: 0;">✅ Porudžbina odobrena!</h2>
        </div>
        
        <p>Poštovani/a ${order.customer.firstName},</p>
        <p>Sa zadovoljstvom Vas obaveštavamo da je Vaša porudžbina <strong>#${order.orderNumber}</strong> odobrena!</p>
        
        ${deliveryInfo}
        
        ${order.adminNote ? `<p style="background: #fff3cd; padding: 15px; border-radius: 5px;"><strong>Napomena:</strong> ${order.adminNote}</p>` : ''}
        
        <p style="font-size: 18px; color: #1a1a1a; margin-top: 20px;"><strong>Ukupan iznos za plaćanje: ${order.totalAmount.toLocaleString()} RSD</strong></p>
        <p style="color: #666; font-size: 14px;">Plaćanje se vrši prilikom preuzimanja.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888;">Srdačno,<br>Venhart Concept Store<br>
        <a href="https://www.instagram.com/venhart.store/" style="color: #d4a574;">@venhart.store</a></p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Venhart Concept Store | Generala Ljubomira Milića 1, Beograd</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `✅ Porudžbina #${order.orderNumber} odobrena - Venhart`,
    html
  });
};

// Email kupcu - porudžbina odbijena
exports.sendOrderRejected = async (order) => {
  const html = `
    <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: #d4a574; margin: 0; letter-spacing: 3px;">VENHART</h1>
        <p style="color: #888; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px;">CONCEPT STORE</p>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #e74c3c;">Porudžbina nije odobrena</h2>
        <p>Poštovani/a ${order.customer.firstName},</p>
        <p>Nažalost, Vaša porudžbina <strong>#${order.orderNumber}</strong> nije mogla biti odobrena.</p>
        
        ${order.rejectionReason ? `<div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;"><strong>Razlog:</strong> ${order.rejectionReason}</div>` : ''}
        
        <p>Za više informacija, kontaktirajte nas:</p>
        <ul style="color: #666;">
          <li>Telefon: 063 755 5245</li>
          <li>Email: venhartconceptstore@gmail.com</li>
          <li>Instagram: <a href="https://www.instagram.com/venhart.store/" style="color: #d4a574;">@venhart.store</a></li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #888;">Srdačno,<br>Venhart Concept Store</p>
      </div>
      <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Venhart Concept Store | Generala Ljubomira Milića 1, Beograd</p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Porudžbina #${order.orderNumber} - Venhart`,
    html
  });
};