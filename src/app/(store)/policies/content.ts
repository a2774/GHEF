import { supportEmail } from "@/lib/site";

export const policies = {
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        heading: "What we collect",
        body: "Your name, email, mobile number, delivery addresses, order history, enquiries and newsletter sign-up. Passwords are stored only as secure hashes.",
      },
      {
        heading: "Why we use it",
        body: "To run your account, process and deliver orders, answer enquiries and send emails you asked for. We do not sell your personal data.",
      },
      {
        heading: "Who we share it with",
        body: "Service providers that run the store, such as hosting, database, image, email, payment and delivery partners, and only as needed for those services.",
      },
      {
        heading: "Your choices",
        body: `To access, correct or delete your data, or to raise a concern, write to ${supportEmail}. You can unsubscribe from emails at any time.`,
      },
      {
        heading: "Cookies",
        body: "We use necessary cookies for login, security and your cart. We do not currently use advertising or analytics cookies.",
      },
    ],
  },
  terms: {
    title: "Terms of use",
    sections: [
      {
        heading: "Using this site",
        body: "By using this site you agree to these terms and to give accurate account and delivery details.",
      },
      {
        heading: "Orders and prices",
        body: "Prices are in Indian rupees and include taxes unless stated otherwise. We may cancel an order that cannot be fulfilled and will refund any amount paid.",
      },
      {
        heading: "Handmade products",
        body: "Handmade items can vary slightly in colour, size and finish. These variations are natural.",
      },
    ],
  },
  shipping: {
    title: "Shipping policy",
    sections: [
      {
        heading: "Where we deliver",
        body: "We currently accept orders for delivery addresses in India.",
      },
      {
        heading: "Delivery details",
        body: "After your order is shipped, your courier and tracking number appear in your account under Orders.",
      },
    ],
  },
  returns: {
    title: "Returns and refunds",
    sections: [
      {
        heading: "Cancelling an order",
        body: "You can cancel from your account until your order has shipped.",
      },
      {
        heading: "Requesting a return",
        body: "After delivery, open the order in your account and send a return request with the reason. We review each request and update its status there.",
      },
      {
        heading: "Refunds",
        body: `Approved refunds are processed to the original payment method where possible. For help, write to ${supportEmail}.`,
      },
    ],
  },
};

export type PolicySlug = keyof typeof policies;

export const policySlugs = Object.keys(policies) as PolicySlug[];
