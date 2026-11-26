/**
 * Single Source of Truth for Kuan-Ying Huang (Kerwin)'s Personal Website.
 *
 * Edit ONLY this file to update your profile, career timeline, projects, or certifications.
 *
 * Adding a new project automatically updates:
 *   1. The 3D Exhibition Ring & Vertical 3D DNA Helix (any even or odd count)
 *   2. The colored DNA spine beads & era swatches/counts (matched by `category`)
 *   3. The searchable 4-column Swiss Poster Gallery & category filter tabs
 *
 * Zero-config project template (no SVG, preset, or theme required):
 *   {
 *     category: "Experiments", kind: "GitHub", stack: "Rust · AI",
 *     title: "My New Project",
 *     url: "https://github.com/magikerwin/my-new-project",
 *   }
 *
 * Optional visual overrides:
 *   - label / badge: short tile text (auto-derived if omitted)
 *   - preset: "curve" | "matrix" | "camera" | "map" | "helmet" | "face" |
 *             "pedestrian" | "vehicle" | "robot" | "graph" | "nodes" |
 *             "blocks" | "trio" | "bars" | "type"
 *   - theme:  "crimson" | "cream" | "forest" | "orange" | "cobalt" | "obsidian" |
 *             "gold" | "paper" | "blush" | "slate" | "sand" | "indigo" | "stone" | "teal"
 *   - image:  "./images/my_demo.png" (real photo/screenshot with Swiss footer overlay)
 *   - art:    "<svg ...>...</svg>" (raw custom SVG override)
 */
export const SITE_DATA = {
  profile: {
    brand: "KERWIN",
    fullName: "Kuan-Ying Huang",
    nickname: "Kerwin",
    roleLine: "Software Engineer at Google",
    specialty: "AI/ML & 3D Computer Vision",
    location: "Taipei, Taiwan",
    email: "qwerzxcv98@gmail.com",
    portrait: "./images/head_shot.png",
    yearsExp: "8+ yrs",
    bioHtml:
      'Turning <strong>research</strong> into reliable software by day—training for <strong>triathlons</strong> by night.',
    avatarQuotes: [
      {
        leg: "swim",
        tag: "SWIM",
        color: "#0B7A75",
        text: "Open-water sighting: swallowed lake water. Fatal: unhandled input stream.",
      },
      {
        leg: "bike",
        tag: "BIKE",
        color: "#E8431F",
        text: "Max wattage on climbs. CPU throttling, legs overfitting.",
      },
      {
        leg: "run",
        tag: "RUN",
        color: "#D99B00",
        text: "Final kilometers: battery 10%. Executing banana_gel.sh to avoid meltdown.",
      },
      {
        leg: "transition",
        tag: "T1 → T2",
        color: "#1943B8",
        text: "Transition zone: hot-swapping hardware under race-day latency.",
      },
    ],
    links: {
      github: "https://github.com/magikerwin",
      linkedin: "https://www.linkedin.com/in/kuan-ying-huang-1993-magiclover/",
    },
  },

  /**
   * 01 · Career × Foundations paired rows rendered along the continuous DNA spine.
   * Each `era.category` automatically binds matching project swatches, counts, and DNA bead highlights.
   */
  journey: [
    {
      pin: "NOW",
      categories: ["Rust & WASM"],
      career: {
        variant: "obsidian",
        live: true,
        date: "2021 – Present",
        location: "New Taipei, TW",
        org: "Google",
        role: "Software Engineer",
        desc: "Building production-scale AI/ML applications and turning research models into reliable, real-world software.",
        filterCategory: "Rust & WASM",
        chipLabel: "Rust/WASM",
      },
      foundation: {
        type: "focus",
        variant: "warm",
        kickerLeft: "Highlights",
        kickerRight: "Snapshot",
        items: [
          { label: "Focus", value: "End-to-end ML pipelines from prototype to scale" },
          { label: "Side Lab", value: "Rust + Burn neural nets compiled to WebAssembly" },
          {
            label: "Endurance",
            value: "Triathlete",
            triLegs: ["swim", "bike", "run"],
          },
        ],
      },
    },
    {
      pin: "2017–21",
      categories: ["3D & Vision"],
      career: {
        date: "2017 – 2021",
        location: "Taipei, TW",
        org: "LIPS Corp.",
        role: "Algorithm Engineer",
        desc: "Shipped 3D Time-of-Flight hand gesture controls, LIPSFace™ 3D facial recognition terminal, PPE safety detection, and RGB/ToF pedestrian tracking.",
        filterCategory: "3D & Vision",
        chipLabel: "Vision Works",
      },
      foundation: {
        type: "spec",
        kickerLeft: "Core Stack",
        kickerRight: "Spec",
        specs: [
          { label: "Languages", value: "Python · C++ · Rust" },
          { label: "Specialties", value: "AI/ML · 3D ToF CV" },
          { label: "Runtimes", value: "TensorFlow · Burn · WASM" },
          { label: "Edge & Cloud", value: "GCP · Embedded Vision" },
        ],
      },
    },
    {
      pin: "2011–17",
      categories: ["Research", "Experiments"],
      swatchCategory: "Research",
      career: {
        date: "2015 – 2016",
        location: "Taoyuan, TW",
        org: "Symtek Automation Asia",
        role: "Robotics Vision Coop",
        desc: "Built automated visual detection of copper clad laminates to guide an industrial robotic arm on the factory floor.",
        filterCategory: "Research",
        chipLabel: "Research Works",
      },
      foundation: {
        type: "education",
        variant: "warm",
        kickerLeft: "Education",
        kickerRight: "EE",
        degrees: [
          {
            degree: "M.S. Electrical Engineering",
            school: "National Central University · DL Vehicle CV & Skeletonization",
            years: "2015–17",
          },
          {
            degree: "B.S. Electrical Engineering",
            school: "National University of Kaohsiung · Algorithms & EE",
            years: "2011–15",
          },
        ],
      },
    },
  ],

  /**
   * 02 · Unified Projects List — drives the 3D Ring, Vertical 3D DNA,
   * DNA spine beads, Career era swatches, and 4-column Poster Gallery.
   */
  projects: [
    {
      label: "BURN GEN", badge: "WASM", preset: "curve", theme: "crimson",
      category: "Rust & WASM", kind: "GitHub", stack: "Rust · WASM",
      title: "Interactive Drawing Generator (Rust-Burn & WebAssembly)",
      url: "https://github.com/magikerwin/burn-drawing-generator",
    },
    {
      label: "BURN CLS", badge: "WASM", preset: "matrix", theme: "cream",
      category: "Rust & WASM", kind: "GitHub", stack: "Rust · WASM",
      title: "Interactive Drawing Classifier (Rust-Burn & WebAssembly)",
      url: "https://github.com/magikerwin/burn-drawing-classifier",
    },
    {
      label: "TOF VIDEO", badge: "3D", preset: "camera", theme: "forest",
      category: "3D & Vision", kind: "Video", stack: "3D ToF · C++",
      title: "Hand Gesture Recognition using ToF Camera (Video Player)",
      url: "https://www.youtube.com/watch?v=C_zeHXi9gJM",
    },
    {
      label: "TOF MAPS", badge: "3D", preset: "map", theme: "orange",
      category: "3D & Vision", kind: "Video", stack: "3D ToF · C++",
      title: "Hand Gesture Recognition using ToF Camera (Map Searching)",
      url: "https://www.youtube.com/watch?v=CXBR0g1-gug",
    },
    {
      label: "PPE AI", badge: "LIPS", preset: "helmet", theme: "cobalt",
      category: "3D & Vision", kind: "Video", stack: "Deep Learning",
      title: "Personal Protective Equipment (PPE) Detection",
      url: "https://www.youtube.com/watch?v=XWBRbA1G6Sw",
    },
    {
      label: "LIPSFACE™", badge: "3D", preset: "face", theme: "obsidian",
      category: "3D & Vision", kind: "Video", stack: "3D AI · Edge",
      title: "Face Detection for LIPSFace™ 3D AI Facial Recognition Terminal",
      url: "https://www.youtube.com/watch?v=4TDUnNWRbF0",
    },
    {
      label: "VISION", badge: "RGB+D", preset: "pedestrian", theme: "gold",
      category: "3D & Vision", kind: "Video", stack: "RGB+ToF · CV",
      title: "Pedestrian Detection for Surveillance Systems (RGB/ToF)",
      url: "https://youtu.be/vJ69LKp1iNY?t=60",
    },
    {
      label: "DL CV", badge: "VEHICLE", preset: "vehicle", theme: "paper",
      category: "Research", kind: "Paper", stack: "NCU · DL",
      title: "Deep Learning Based Stolen Vehicle Detection",
      url: "https://drive.google.com/file/d/17X7rKNIqJrMb0sX8pnUVxCsLh52pLDJY/view?usp=sharing",
    },
    {
      label: "ROBOT ARM", badge: "CV", preset: "robot", theme: "blush",
      category: "Research", kind: "Paper", stack: "Robotics · CV",
      title: "Copper Clad Laminates Detection for Industrial Robot Arm",
      url: "https://drive.google.com/file/d/1rmmacJn-knPDKPIkiOFxk-T3vpRnbW4s/view?usp=sharing",
    },
    {
      label: "LINE CV", badge: "PY", preset: "graph", theme: "slate",
      category: "Research", kind: "GitHub", stack: "Python · CV",
      title: "Line Thinning by Line Following in Python",
      url: "https://github.com/magikerwin/Line-Following-Python",
    },
    {
      label: "C++ ML", badge: "CORE", preset: "nodes", theme: "sand",
      category: "Experiments", kind: "GitHub", stack: "C++ · ML",
      title: "Machine Learning From Scratch with C++",
      url: "https://github.com/magikerwin/ML-From-Scratch-With-CPP",
    },
    {
      label: "RECSYS", badge: "TF2", preset: "blocks", theme: "indigo",
      category: "Experiments", kind: "GitHub", stack: "Python · TF2",
      title: "Recommender System Algorithms in TensorFlow 2.0+",
      url: "https://github.com/magikerwin/RecSys-tf2",
    },
    {
      label: "JULIA CV", badge: "FLUX", preset: "trio", theme: "stone",
      category: "Experiments", kind: "GitHub", stack: "Julia · Flux",
      title: "Monkey Classification with Julia and Flux",
      url: "https://github.com/magikerwin/1st-Julia-DL-CV-Marathon/tree/master/homework/Day-034_036",
    },
    {
      label: "WORDCLOUD", badge: "PY", preset: "bars", theme: "teal",
      category: "Experiments", kind: "GitHub", stack: "Python · Web",
      title: "Scraping a Wordcloud with Python",
      url: "https://github.com/magikerwin/1st-PyCrawlerMarathon/tree/master/homework/Day-038_040",
    },
  ],

  /** 03 · Verified Certifications (tab labels read directly from `tab`) */
  certifications: [
    {
      tab: "Deep Learning",
      items: [
        { title: "TensorFlow Developer Certificate", issuer: "TensorFlow", url: "https://www.credential.net/f67fb353-2cd8-46da-832b-68f8840ec3f2" },
        { title: "DeepLearning.AI TensorFlow Developer", issuer: "DeepLearning.AI", url: "https://www.coursera.org/account/accomplishments/specialization/certificate/WCJR2V4EZU6J" },
        { title: "Deep Learning Specialization", issuer: "Coursera", url: "https://www.coursera.org/account/accomplishments/specialization/certificate/WR5DFV4A6RY4" },
        { title: "Machine Learning (Stanford)", issuer: "Coursera", url: "https://www.coursera.org/account/accomplishments/certificate/QLK7L2AWAJZP" },
        { title: "100-Day Machine Learning in Python", issuer: "Cupoy Marathon", url: "https://github.com/magikerwin/100Day-ML-Marathon/blob/master/Certificate.pdf" },
      ],
    },
    {
      tab: "Cloud & Vision",
      items: [
        { title: "Advanced ML with TensorFlow on GCP", issuer: "Google Cloud", url: "https://www.coursera.org/account/accomplishments/specialization/certificate/BPSUYGJ7WCGB" },
        { title: "ML with TensorFlow on GCP", issuer: "Google Cloud", url: "https://www.coursera.org/account/accomplishments/specialization/certificate/FD7GSV62PUPX" },
        { title: "Cloud Service Hands-On Training", issuer: "Qwiklabs", url: "https://www.qwiklabs.com/public_profiles/c0a529f5-aff7-473c-917c-dbbfd3a8c5ca" },
        { title: "Deep Learning & CV in Julia", issuer: "Cupoy Marathon", url: "https://github.com/magikerwin/1st-DL-CVMarathon/blob/master/Certificate.pdf" },
      ],
    },
    {
      tab: "Algorithms & Web",
      items: [
        { title: "AlgoExpert Certificate", issuer: "AlgoExpert", url: "https://certificate.algoexpert.io/AE-463b601e71" },
        { title: "JS Algorithms & Data Structures", issuer: "freeCodeCamp", url: "https://www.freecodecamp.org/certification/fcc5e80ebfc-c862-45d1-a576-f419a0f828b4/javascript-algorithms-and-data-structures" },
        { title: "Responsive Web Design (HTML & CSS)", issuer: "freeCodeCamp", url: "https://www.freecodecamp.org/certification/fcc5e80ebfc-c862-45d1-a576-f419a0f828b4/responsive-web-design" },
        { title: "Web Crawling Marathon in Python", issuer: "Cupoy Marathon", url: "https://github.com/magikerwin/1st-PyCrawlerMarathon/blob/master/Certificate.pdf" },
      ],
    },
  ],
};
