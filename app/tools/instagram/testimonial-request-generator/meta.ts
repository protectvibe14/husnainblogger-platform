import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/testimonial-request-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ayesha Khan',
  },
  {
    id: 'project',
    label: 'Project or service',
    type: 'text',
    required: true,
    placeholder: 'e.g. Instagram growth audit',
  },
  {
    id: 'channel',
    label: 'Channel',
    type: 'select',
    required: true,
    options: ['Direct message (DM)', 'Email', 'In person'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'requestScript',
    label: 'Testimonial request script (copy)',
    type: 'copy',
    description:
    'Free how to ask for testimonial 2026: A ready-to-send request tailored to your channel. free.',
  },
  {
    id: 'questionPrompts',
    label: 'Prompt questions',
    type: 'list',
    description:
    'Six guided questions that make testimonials easy to write.',
  },
  {
    id: 'thankYouNote',
    label: 'Thank-you note (copy)',
    type: 'copy',
    description:
    'A warm follow-up to send after the testimonial arrives.',
  },
];

export const content: ToolContent = {
  title: 'How to Ask for Testimonial',
  description:
    'Get how to ask for testimonial scripts that work: ready-to-send DM, email, or in-person requests plus six smart prompts. Free — build yours now.',
  howTo: [
    'Type the client\u2019s name in the "Client name" box.',
    'Describe the work in the "Project or service" box so the script feels personal.',
    'Pick the channel you will use: Direct message (DM), Email, or In person.',
    'Run the tool to get a request script written for that channel — the email version even includes a subject line.',
    'Copy the "Request script", then send or read it as-is; use the six prompt questions when the client asks what to write about.',
    'When the testimonial arrives, send the generated thank-you note to keep the relationship warm.',
  ],
  methodology:
    'This tool assembles your script from a fixed bank of 12 hand-written request templates (4 per channel: DM, email, in person), 6 fixed guiding questions, and 3 thank-you notes. A deterministic hash of your inputs picks one template from each bank, so the same inputs always produce the same output. Nothing is written by AI and nothing is fetched from the web — every word comes from the fixed banks.',
  examples: [
    {
      title: 'DM request to a client',
      inputs: {
        clientName: 'Ayesha Khan',
        project: 'Instagram growth audit',
        channel: 'Direct message (DM)',
      },
      note: 'A short, friendly DM script with an offer to send guiding questions.',
    },
    {
      title: 'Email request with subject line',
      inputs: {
        clientName: 'Danish Raza',
        project: 'brand photoshoot',
        channel: 'Email',
      },
      note: 'A full email with subject line and numbered prompt questions embedded.',
    },
    {
      title: 'In-person talking points',
      inputs: {
        clientName: 'Meera Shah',
        project: 'website redesign',
        channel: 'In person',
      },
      note: 'Bullet talking points to read through during a face-to-face or video call.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how to ask for testimonial?',
      answer:
        'The best way to ask for a testimonial is short, specific, and easy to answer: name the project, suggest it only takes a minute, and offer guiding questions so the client never stares at a blank screen. This tool builds exactly that kind of request for DM, email, or in-person conversations.',
    },
    {
      question: 'Is there a free how to ask for testimonial?',
      answer:
        'Yes — this testimonial request generator is completely free with no signup. Enter the client\u2019s name, the project, and your channel, and get a request script, six prompt questions, and a thank-you note instantly.',
    },
    {
      question: 'How to use how to ask for testimonial?',
      answer:
        'Type the client\u2019s name, describe the project, pick your channel (DM, email, or in person), and run the tool. Copy the generated script, send it, and use the six prompt questions if the client asks what to write about.',
    },
    {
      question: 'How does a how to ask for testimonial work?',
      answer:
        'This tool picks a request template from a fixed bank of 12 channel-specific scripts, fills in your client\u2019s name and project, and pairs it with six fixed guiding questions and a thank-you note. Everything runs in your browser — no AI, no signup, and your entries are never sent anywhere.',
    },
    {
      question: 'How does the how to ask for testimonial work?',
      answer:
        'Enter your details using the inputs above and the how to ask for testimonial calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the how to ask for testimonial free to use?',
      answer:
        'Yes - this how to ask for testimonial is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a how to ask for testimonial?',
      answer:
        'A how to ask for testimonial is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Scripts come from fixed hand-written templates — they are starting points, not AI-written copy. Adjust the tone to match your relationship with the client.',
    'The tool cannot send messages or fetch contacts — it only produces the text for you to send.',
    'Always ask permission before publishing a testimonial with the client\u2019s name.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Testimonial Request Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
