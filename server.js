const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Correspondance entre le handle Shopify et le Price ID Stripe
const PRICE_MAP = {
  'lux-cove-7-in-1-led-face-mask':                          'price_1TXOkaCwYJAaPde7us4Nvsxc',
  'lux-cove-7-in-1-led-facial-sculptor':                    'price_1TXOhNCwYJAaPde7bM0odEPA',
  'lux-cove-anti-aging-sheet-mask-set-4-pcs':               'price_1TXOxQCwYJAaPde7i1QxhnI7',
  'lux-cove-anti-aging-vitamin-c-serum':                    'price_1TXOvTCwYJAaPde7SdeQaTxO',
  'lux-cove-ems-microcurrent-activating-gliding-gel':       'price_1TXOpKCwYJAaPde7l7p2TsEq',
  'lux-cove-gift-card':                                     'price_1TXPGjCwYJAaPde76DrgeG5p',
  'lux-cove-gift-card-10':                                  'price_1TXPPYCwYJAaPde7tE9G0Xh2',
  'lux-cove-gift-card-25':                                  'price_1TXPQFCwYJAaPde7jKHOxV8O',
  'lux-cove-gift-card-50':                                  'price_1TXPQzCwYJAaPde7JWctamGb',
  'lux-cove-gift-card-100':                                 'price_1TXPRbCwYJAaPde7NVz297OM',
  'lux-cove-high-frequency-therapy-wand':                   'price_1TXOrdCwYJAaPde7bQ8h6DaV',
  'lux-cove-hydrating-rice-toner':                          'price_1TXOymCwYJAaPde7fQTReaDY',
  'lux-cove-kojic-acid-overnight-collagen-mask':            'price_1TXP1mCwYJAaPde7lzu7hdCJ',
  'lux-cove-led-face-sculptor-travel-case':                 'price_1TXP31CwYJAaPde7T7hJx8tT',
  'lux-cove-luxury-cloud-headband-wristband-set':           'price_1TXP4DCwYJAaPde7YBOYgZDq',
  'lux-cove-overnight-collagen-mask':                       'price_1TXOuYCwYJAaPde7BVQEBahc',
  'lux-cove-red-light-under-eye-glasses':                   'price_1TXOnZCwYJAaPde704E1lkmj',
  'lux-cove-skin-firming-5-in-1-hyaluronic-acid-face-serum': 'price_1TXOwOCwYJAaPde7MHB3U9gO',
  'the-ultimate-guide-to-led-light-therapy-for-anti-aging-ebook': 'price_1TXP5CCwYJAaPde78fDA87TN',
};

// Route principale : reçoit le panier Shopify et crée une session Stripe
app.post('/create-checkout', async (req, res) => {
  try {
    const { items } = req.body;
    // items = [{ handle: 'lux-cove-...', quantity: 2 }, ...]

    const line_items = [];

    for (const item of items) {
      const priceId = PRICE_MAP[item.handle];
      if (!priceId) {
        console.warn(`Produit inconnu : ${item.handle}`);
        continue;
      }
      line_items.push({
        price: priceId,
        quantity: item.quantity,
      });
    }

    if (line_items.length === 0) {
      return res.status(400).json({ error: 'Aucun produit valide dans le panier.' });
    }

    const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items,
  shipping_address_collection: {
    allowed_countries: [
      // Europe
      'AD','AL','AT','BA','BE','BG','CH','CY','CZ','DE','DK','EE','ES',
      'FI','FO','FR','GB','GI','GR','HR','HU','IE','IS','IT','LI','LT',
      'LU','LV','MC','MD','ME','MK','MT','NL','NO','PL','PT','RO','RS',
      'SE','SI','SK','SM','UA','VA',
      // Amérique du Nord
      'US','CA','MX',
      // Océanie
      'AU','NZ',
      // Asie (grands marchés)
      'JP','KR','SG','HK','TW'
    ],
  },
  phone_number_collection: {
    enabled: true,
  },
  billing_address_collection: 'required',
  success_url: 'https://i2crvf-sh.myshopify.com/pages/merci',
  cancel_url: 'https://i2crvf-sh.myshopify.com/cart',
});

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Serveur Stripe OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
