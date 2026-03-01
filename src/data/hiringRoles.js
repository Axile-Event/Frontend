/**
 * @typedef {Object} HiringRole
 * @property {string} slug
 * @property {string} title
 * @property {string} team
 * @property {"intern"} roleType
 * @property {string} employmentType
 * @property {string} location
 * @property {string} duration
 * @property {string} description
 * @property {string[]} responsibilities
 * @property {string[]} requirements
 * @property {string[]} [niceToHave]
 */

/** @type {HiringRole[]} */
export const hiringRoles = [
  {
    slug: "social-media-manager-intern",
    title: "Social Media Manager (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time/Full-time",
    location: "Remote (Nigeria)",
    duration: "3–6 Months",
    description:
      "As our Social Media Manager Intern, you'll be the voice of Axile.ng across all social platforms. You'll craft compelling content strategies, engage with our growing community, and help establish our brand presence in the Nigerian events space. This role offers hands-on experience in digital marketing, content strategy, and community management for a fast-growing tech startup.",
    responsibilities: [
      "Develop and execute social media strategies across Instagram, Twitter/X, TikTok, LinkedIn, and Facebook",
      "Plan, schedule, and publish engaging content that aligns with Axile's brand voice and marketing goals",
      "Monitor trends, hashtags, and conversations relevant to events, entertainment, and Nigerian pop culture",
      "Engage with followers, respond to comments and DMs, and build a vibrant online community",
      "Track and report on KPIs such as engagement rate, follower growth, reach, and conversions",
      "Collaborate with content creator and graphic designer to produce high-quality visual and written content",
      "Run paid social campaigns and assist with influencer partnerships when needed",
    ],
    requirements: [
      "Strong understanding of major social platforms (Instagram, Twitter/X, TikTok, LinkedIn)",
      "Excellent written communication and copywriting skills",
      "Experience managing at least one social media account (personal or professional)",
      "Basic knowledge of analytics tools (Meta Business Suite, Twitter Analytics, etc.)",
      "Passion for events, entertainment, and Nigerian pop culture",
      "Currently enrolled in or recently graduated from a relevant program (Marketing, Communications, Mass Media, etc.)",
    ],
    niceToHave: [
      "Experience with paid social advertising (Meta Ads, Twitter Ads)",
      "Familiarity with influencer marketing strategies",
      "Personal social media following or content creation experience",
    ],
  },
  {
    slug: "content-writer-intern",
    title: "Content Writer (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time/Full-time",
    location: "Remote (Nigeria)",
    duration: "3–6 Months",
    description:
      "As our Content Writer Intern, you'll be responsible for creating engaging written content that tells the Axile.ng story. From blog posts and newsletters to social captions and press releases, your words will help shape how the world sees our platform. This is a great opportunity for aspiring writers and communicators who want to build a portfolio in tech and events.",
    responsibilities: [
      "Write clear, engaging, and on-brand blog posts, articles, and feature stories",
      "Draft social media captions, email newsletters, and website copy",
      "Research trending topics in the events, tech, and entertainment industries",
      "Collaborate with the social media manager and content creator on campaign messaging",
      "Proofread and edit content to ensure accuracy, consistency, and quality",
      "Develop content calendars and maintain a consistent publishing schedule",
    ],
    requirements: [
      "Exceptional writing and editing skills in English",
      "Ability to adapt writing style for different platforms and audiences",
      "Strong research skills and attention to detail",
      "Familiarity with SEO basics and content marketing principles",
      "Interest in events, entertainment, or the Nigerian tech ecosystem",
      "Currently enrolled in or recently graduated from a relevant program (English, Journalism, Communications, Marketing, etc.)",
    ],
    niceToHave: [
      "Published writing samples (blog posts, articles, or academic papers)",
      "Experience with content management systems (WordPress, Medium, etc.)",
      "Knowledge of email marketing tools (Mailchimp, Substack, etc.)",
    ],
  },
  {
    slug: "content-creator-intern",
    title: "Content Creator (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time/Full-time",
    location: "Remote (Nigeria)",
    duration: "3–6 Months",
    description:
      "As our Content Creator Intern, you'll bring Axile.ng's brand to life through dynamic video and visual content. From short-form videos and reels to behind-the-scenes coverage and event recaps, you'll create content that captures attention and drives engagement. If you're passionate about storytelling through video and love the events scene, this role is for you.",
    responsibilities: [
      "Create engaging short-form video content for TikTok, Instagram Reels, and YouTube Shorts",
      "Plan, shoot, and edit video content that aligns with Axile's brand and campaigns",
      "Cover events (virtually or in-person) and produce recap content",
      "Collaborate with the social media manager and graphic designer on visual storytelling",
      "Stay on top of content trends, memes, and viral formats relevant to the Nigerian audience",
      "Assist in building Axile's YouTube and TikTok presence from the ground up",
    ],
    requirements: [
      "Strong video editing skills (CapCut, Premiere Pro, Final Cut, or similar)",
      "Experience creating content for social media platforms (TikTok, Instagram, YouTube)",
      "Good eye for aesthetics, visual storytelling, and brand consistency",
      "Ability to work independently and meet deadlines",
      "Passion for events, music, entertainment, or Nigerian youth culture",
      "Currently enrolled in or recently graduated from a relevant program (Film, Media, Communications, etc.)",
    ],
    niceToHave: [
      "Existing content portfolio or social media presence",
      "Photography skills",
      "Experience with motion graphics or animation",
    ],
  },
  {
    slug: "graphic-designer-intern",
    title: "Graphic Designer (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time/Full-time",
    location: "Remote (Nigeria)",
    duration: "3–6 Months",
    description:
      "As our Graphic Designer Intern, you'll be responsible for creating stunning visuals that communicate Axile.ng's brand identity. From social media graphics and event flyers to UI elements and brand collateral, your designs will play a key role in how users perceive and interact with our platform. This is perfect for creative individuals looking to gain real-world design experience at a tech startup.",
    responsibilities: [
      "Design eye-catching social media graphics, stories, and promotional materials",
      "Create event flyers, banners, and digital ads for campaigns",
      "Maintain and evolve Axile's visual brand identity and design system",
      "Collaborate with the content team to produce visually compelling posts and articles",
      "Design UI elements, landing pages, or marketing assets as needed",
      "Ensure all designs are optimized for various platforms and screen sizes",
    ],
    requirements: [
      "Proficiency in design tools (Figma, Adobe Illustrator, Photoshop, or Canva Pro)",
      "Strong understanding of color theory, typography, and layout principles",
      "Ability to translate ideas and briefs into polished visual designs",
      "Portfolio showcasing previous design work (personal or professional)",
      "Attention to detail and ability to follow brand guidelines",
      "Currently enrolled in or recently graduated from a relevant program (Graphic Design, Fine Arts, Visual Communication, etc.)",
    ],
    niceToHave: [
      "Experience with motion design or animation (After Effects, Lottie)",
      "Familiarity with UI/UX design principles",
      "Experience designing for both print and digital formats",
    ],
  },
  {
    slug: "campus-ambassador-intern",
    title: "Campus Ambassador (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time",
    location: "On-campus (Nigeria)",
    duration: "3–6 Months",
    description:
      "As a Campus Ambassador for Axile.ng, you'll represent our brand on your university campus. You'll be the go-to person for everything Axile in your school — from promoting events and driving sign-ups to gathering feedback and building a community of event lovers. This is a high-impact, flexible role for students who are well-connected and passionate about events.",
    responsibilities: [
      "Represent Axile.ng on your campus and promote the platform to fellow students",
      "Organize or co-host campus events, meetups, or activations in partnership with Axile",
      "Drive sign-ups, app downloads, and event ticket sales within your campus community",
      "Share Axile content on your personal social media and campus groups",
      "Gather feedback from students and report insights to the marketing team",
      "Collaborate with other campus ambassadors and the central marketing team on campaigns",
    ],
    requirements: [
      "Currently enrolled as a student at a Nigerian university or polytechnic",
      "Strong social network and influence within your campus community",
      "Excellent communication and interpersonal skills",
      "Active on social media with an understanding of student culture",
      "Self-motivated, proactive, and able to work independently",
      "Passion for events, entertainment, and community building",
    ],
    niceToHave: [
      "Previous experience as a brand ambassador or campus rep",
      "Leadership roles in student organizations or clubs",
      "Experience organizing events on campus",
    ],
  },
  {
    slug: "pr-manager-intern",
    title: "PR Manager (Intern)",
    team: "Media & Publicity",
    roleType: "intern",
    employmentType: "Part-time/Full-time",
    location: "Remote (Nigeria)",
    duration: "3–6 Months",
    description:
      "As our PR Manager Intern, you'll help shape Axile.ng's public image and media presence. You'll handle press outreach, draft press releases, manage media relationships, and support crisis communication strategies. This is a fantastic opportunity for someone who wants to break into public relations in the tech and events industry.",
    responsibilities: [
      "Draft press releases, media pitches, and official company communications",
      "Build and maintain relationships with journalists, bloggers, and media outlets",
      "Monitor media coverage and public sentiment related to Axile and the events industry",
      "Coordinate interviews, press briefings, and media appearances",
      "Support the development and execution of PR campaigns and launches",
      "Assist with crisis communication planning and response when needed",
    ],
    requirements: [
      "Strong written and verbal communication skills",
      "Understanding of media relations and public relations principles",
      "Ability to write professional press releases and media kits",
      "Interest in the tech startup and events ecosystem in Nigeria",
      "Strong organizational skills and attention to detail",
      "Currently enrolled in or recently graduated from a relevant program (Public Relations, Communications, Journalism, Marketing, etc.)",
    ],
    niceToHave: [
      "Existing relationships with Nigerian media outlets or journalists",
      "Experience with PR tools (Muck Rack, Cision, or similar)",
      "Previous internship or work experience in a PR or communications role",
    ],
  },
];

/**
 * Find a role by its slug.
 * @param {string} slug
 * @returns {HiringRole | undefined}
 */
export function getRoleBySlug(slug) {
  return hiringRoles.find((role) => role.slug === slug);
}

/**
 * Get all available role slugs.
 * @returns {string[]}
 */
export function getAllRoleSlugs() {
  return hiringRoles.map((role) => role.slug);
}
