import type { EnquiryTypeKey } from "@/lib/catalog-taxonomy";

export type Service = {
  title: string;
  enquiryType: EnquiryTypeKey;
  headline: string;
  intro: string;
  points: { title: string; body: string }[];
  steps: string[];
  formHint: string;
};

export const services = {
  "custom-carpets": {
    title: "Custom carpets",
    enquiryType: "custom",
    headline: "Woven to your measurements.",
    intro:
      "Any size, any shape and the colours of your room. Share a sketch, a photo or just the floor size, and our weavers make it for you.",
    points: [
      { title: "Any size or shape", body: "Rectangles, rounds, runners and free-form shapes, cut to the centimetre." },
      { title: "Your palette", body: "Match paint, upholstery or a fabric swatch. We send yarn colours to approve first." },
      { title: "Your pick of craft", body: "Hand knotted, hand tufted or flat woven, in wool, viscose or jute." },
    ],
    steps: ["Share your size and idea", "Approve the design and yarn", "We weave and finish it", "Delivered to your door"],
    formHint: "Room size, shape, colours and what you have in mind",
  },
  "bulk-and-export": {
    title: "Bulk and export",
    enquiryType: "bulk",
    headline: "For hotels, studios and stores.",
    intro:
      "Carpets for hospitality, offices, interior projects and retailers, in India and abroad, straight from our looms.",
    points: [
      { title: "Project pricing", body: "Trade rates on volume, with samples before you commit." },
      { title: "Consistent batches", body: "Colour and size held to the approved sample across every piece." },
      { title: "Export ready", body: "Packing, paperwork and shipping arranged for international orders." },
    ],
    steps: ["Tell us the project", "Receive samples and a quote", "Production with updates", "Packed and shipped"],
    formHint: "Business name, quantities, sizes and delivery country",
  },
  "cleaning-and-repair": {
    title: "Cleaning and repair",
    enquiryType: "cleaning",
    headline: "Bring an old favourite back.",
    intro: "Deep washing, stain treatment, fringe and edge repair, and re-weaving of worn patches by hand.",
    points: [
      { title: "Hand washing", body: "Gentle washing that is safe for wool, silk and natural dyes." },
      { title: "Edge and fringe repair", body: "Binding and fringes rebuilt to match the original." },
      { title: "Re-weaving", body: "Holes and worn areas re-knotted by our weavers." },
    ],
    steps: ["Send photos and the size", "Get a quote", "Pick up or drop off", "Returned cleaned and repaired"],
    formHint: "Carpet size, what needs fixing and your city",
  },
  "wall-to-wall": {
    title: "Wall to wall carpet",
    enquiryType: "wall_to_wall",
    headline: "Edge to edge comfort.",
    intro: "Fitted carpet for homes, offices, hotels and halls, measured and installed by our team.",
    points: [
      { title: "Measured on site", body: "We measure the space and plan seams before cutting." },
      { title: "Right pile for the room", body: "From soft bedroom pile to hard-wearing office loop." },
      { title: "Fitted cleanly", body: "Underlay, gripper and finishing included in the quote." },
    ],
    steps: ["Share the area and city", "Site visit and samples", "Quote and schedule", "Installation"],
    formHint: "Area in square feet, type of space and your city",
  },
} satisfies Record<string, Service>;

export type ServiceSlug = keyof typeof services;
export const serviceSlugs = Object.keys(services) as ServiceSlug[];
