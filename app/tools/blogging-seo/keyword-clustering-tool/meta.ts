import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'keywords',
    label: 'Keywords',
    type: 'textarea',
    required: true,
    placeholder: 'One keyword per line, e.g.\nbest running shoes\nrunning shoes guide\nsourdough bread recipe',
  },
  {
    id: 'similarityThreshold',
    label: 'Similarity threshold',
    type: 'number',
    required: false,
    placeholder: '0.35 (range 0.1 - 0.9)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'clusters',
    label: 'Keyword clusters',
    type: 'table',
    description: 'Groups of 2+ related keywords with a representative label.',
  },
  {
    id: 'unclustered',
    label: 'Unclustered keywords',
    type: 'list',
    description: 'Keywords that did not group with any other keyword.',
  },
  {
    id: 'clusterCount',
    label: 'Number of clusters',
    type: 'number',
    description: 'How many clusters (groups of 2+) were found.',
  },
];

export const content: ToolContent = {
  title: 'Keyword Clustering Tool – Free SEO 2026 | HusnainBlogger',
  description:
    'Free keyword clustering tool 2026: group keywords into topic clusters to avoid cannibalization. Paste your list, tune the threshold, cluster now. No signup.',
  howTo: [
    'Paste your keyword list into the Keywords box, one keyword per line (2-500 unique keywords).',
    'Optionally set a Similarity threshold between 0.1 and 0.9 (default 0.35; lower groups more loosely, higher splits more strictly).',
    'Click Cluster to group the keywords by stemmed word overlap.',
    'Review the cluster table — each row shows a representative label and its keywords.',
    'Check the unclustered list for loners that may need their own angle or a rewrite.',
    'Use each cluster as one article or page topic to avoid keyword cannibalization.',
  ],
  methodology:
    'Keywords are lowercased, tokenized and passed through a naive English stemmer, then compared pairwise with Jaccard similarity over stemmed token sets. A greedy single-link pass assigns each keyword (processed alphabetically) to the first cluster whose best member similarity meets your threshold, or starts a new cluster. Each cluster is labeled with its medoid — the member most similar to the others. No embeddings, no AI model and no search data are used; this is draft-level grouping to review by hand.',
  examples: [
    {
      title: 'Running blog list',
      inputs: { keywords: 'best running shoes\nrunning shoes guide\ncheap running shoes\nsourdough bread recipe' },
      note: 'The three shoe keywords cluster together; the bread keyword stays unclustered.',
    },
    {
      title: 'Stricter grouping',
      inputs: {
        keywords: 'email subject lines\nsubject line tips\ntiktok growth tips',
        similarityThreshold: 0.6,
      },
      note: 'A higher threshold splits loosely related keywords apart — useful for fine topic splits.',
    },
  ],
  faqs: [
    {
      question: 'What is the best keyword clustering tool?',
      answer:
        'No independent benchmark proves one clustering tool "the best" — results depend on the similarity method and threshold, which many tools hide. This free tool publishes its exact method (stemmed-token Jaccard, greedy single-link) and lets you tune the threshold yourself.',
    },
    {
      question: 'Is there a free keyword clustering tool?',
      answer:
        'Yes — this tool is completely free with no signup and runs entirely in your browser. It groups up to 500 keywords using transparent heuristic rules rather than paid embedding APIs.',
    },
    {
      question: 'How to use keyword clustering?',
      answer:
        'Paste a keyword list, pick a similarity threshold, and cluster: each resulting group should become one page or article so similar keywords do not compete with each other. Review the groups by hand — automated clustering is a draft, not a final content plan.',
    },
    {
      question: 'How does a keyword clustering tool work?',
      answer:
        'This one compares keywords by the overlap of their stemmed words (Jaccard similarity) and greedily groups keywords that score above your threshold. It does not understand meaning the way embeddings do — "cheap flights" and "affordable airfare" share no words and will not cluster.',
    },
    {
      question: 'What is keyword clustering in SEO?',
      answer:
        'Keyword clustering groups search terms that target the same topic so one page can rank for all of them. This tool clusters up to 500 keywords by stemmed word overlap and labels each group, so each cluster becomes a single article instead of competing pages.',
    },
    {
      question: 'Does keyword clustering help with keyword cannibalization?',
      answer:
        'Yes — when two pages chase overlapping terms they can split your rankings, and clustering exposes those overlaps before you write. This tool shows which keywords belong together in one cluster so you build a single page per topic instead of several near-duplicates.',
    },
    {
      question: 'How do I choose the similarity threshold?',
      answer:
        'Start with the default 0.35 and inspect the clusters: raise the threshold toward 0.6 to split groups that feel too loose, or lower it toward 0.1 to merge lonely keywords. The tool reports unclustered keywords separately, which tells you when your threshold is too strict.',
    },
  ],
  assumptions: [
    'Heuristic token-overlap grouping — not semantic embeddings, so true synonyms with no shared words will not cluster.',
    'The stemmer is a crude English suffix-stripper; results are a draft to review, not a final taxonomy.',
    'Duplicate keywords are merged case-insensitively before clustering.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Keyword Clustering Tool – Free SEO 2026 | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/keyword-clustering-tool/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Free keyword clustering tool 2026: group keywords into topic clusters to avoid cannibalization. Paste your list, tune the threshold, cluster now. No signup.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging SEO & Content Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Keyword Clustering Tool',
          item: 'https://husnainblogger.com/tools/blogging-seo/keyword-clustering-tool/',
        },
      ],
    },
  ],
};
