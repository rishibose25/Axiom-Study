export interface Chapter {
  id: string;
  title: string;
  topics?: string[];
}

export interface Unit {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface SubjectSyllabus {
  id: string;
  name: string;
  units: Unit[];
}

// Hierarchical structure: Class -> Stream -> Subjects
export const SYLLABUS_DATA: Record<string, Record<string, SubjectSyllabus[]>> = {
  "Class 9": {
    "ICSE": [
      {
        id: "icse9_english_1",
        name: "English Language",
        units: [
          {
            id: "term1",
            title: "First Term",
            chapters: [
              { id: "e1_1", title: "Notice Writing", topics: ["Format", "Drafting", "Practice"] },
              { id: "e1_2", title: "E-Mail Writing", topics: ["Professional Emails", "Informal Emails", "Structure"] },
              { id: "e1_3", title: "Total English (Unit 1 to 8)", topics: ["Grammar", "Syntax", "Vocabulary", "Usage"] },
              { id: "e1_4", title: "Speaking & Listening Skills", topics: ["Oral Expression", "Aural Comprehension"] }
            ]
          },
          {
            id: "term2",
            title: "Second Term",
            chapters: [
              { id: "e1_5", title: "Letter Writing", topics: ["Formal Letters", "Informal Letters", "Salutations", "Closing"] },
              { id: "e1_6", title: "Composition Writing", topics: ["Descriptive", "Narrative", "Argumentative"] },
              { id: "e1_7", title: "Total English (Unit 9 to 15)", topics: ["Advanced Grammar", "Sentence Transformation"] }
            ]
          }
        ]
      },
      {
        id: "icse9_maths",
        name: "Mathematics",
        units: [
          {
            id: "algebra",
            title: "Algebra",
            chapters: [
              { id: "m3", title: "Expansion", topics: ["Square of Binomial", "Product of Sum and Difference"] },
              { id: "m4", title: "Factorization", topics: ["Difference of Squares", "Trinomials"] },
              { id: "m5", title: "Simultaneous Linear Equations", topics: ["Two variables", "Elimination Method", "Substitution"] },
              { id: "m6", title: "Indices / Exponents", topics: ["Laws of Indices", "Negative Indices"] },
              { id: "m7", title: "Logarithms", topics: ["Definition", "Laws of Logarithms"] }
            ]
          },
          {
            id: "geometry",
            title: "Geometry",
            chapters: [
              { id: "m8", title: "Triangles", topics: ["Congruency", "Isosceles Triangles"] },
              { id: "m9", title: "Mid-Point Theorem", topics: ["Intercept Theorem", "Applications"] },
              { id: "m10", title: "Pythagoras Theorem", topics: ["Hypotenuse", "Square Roots"] },
              { id: "m13", title: "Circle", topics: ["Chords", "Arcs", "Segments"] }
            ]
          },
          {
            id: "mensuration",
            title: "Mensuration",
            chapters: [
              { id: "m16", title: "Area of Plane Figures", topics: ["Rectangles", "Triangles", "Quadrilaterals"] },
              { id: "m18", title: "Surface Area & Volume", topics: ["3D Solids", "Cylinders", "Cones"] }
            ]
          }
        ]
      },
      {
        id: "icse9_physics",
        name: "Physics",
        units: [
          {
            id: "term1",
            title: "First Term",
            chapters: [
              { id: "p1", title: "Measurement and Experimentation", topics: ["Metric System", "Scientific Notation"] },
              { id: "p2", title: "Motion in One Dimension", topics: ["Speed", "Velocity", "Acceleration Graphs"] },
              { id: "p3", title: "Laws of Motion", topics: ["Inertia", "Newton's Second Law", "Action-Reaction"] },
              { id: "p7", title: "Reflection of Light", topics: ["Mirrors", "Images"] }
            ]
          },
          {
            id: "term2",
            title: "Second Term",
            chapters: [
              { id: "p4", title: "Pressure in Fluids", topics: ["Atmospheric Pressure", "Barometers"] },
              { id: "p6", title: "Heat and Energy", topics: ["Temperature", "Calorimetry"] },
              { id: "p9", title: "Current Electricity", topics: ["Ohm's Law", "Circuits"] }
            ]
          }
        ]
      },
      {
        id: "icse9_chemistry",
        name: "Chemistry",
        units: [
          {
            id: "term1",
            title: "First Term",
            chapters: [
              { id: "c1", title: "The Language of Chemistry", topics: ["Symbols", "Valency", "Chemical Equations"] },
              { id: "c2", title: "Study of Gas Laws", topics: ["Boyle's Law", "Charles's Law"] },
              { id: "c4", title: "Water", topics: ["Solubility", "Hydrated Salts"] },
              { id: "c5", title: "Atomic Structure", topics: ["Subatomic Particles", "Isotopes"] }
            ]
          },
          {
            id: "term2",
            title: "Second Term",
            chapters: [
              { id: "c6", title: "The Periodic Table", topics: ["Groups", "Periods", "Properties"] },
              { id: "c7", title: "Study of Hydrogen", topics: ["Preparation", "Properties"] },
              { id: "c8", title: "Atmospheric Pollution", topics: ["Acid Rain", "Ozone Depletion"] }
            ]
          }
        ]
      },
      {
        id: "icse9_biology",
        name: "Biology",
        units: [
          {
            id: "term1",
            title: "First Term",
            chapters: [
              { id: "b1", title: "The Cell", topics: ["Unit of Life", "Organelles"] },
              { id: "b2", title: "Tissues", topics: ["Plant Tissues", "Animal Tissues"] },
              { id: "b3", title: "The Flower", topics: ["Structure", "Pollination"] },
              { id: "b4", title: "Seed", topics: ["Structure", "Germination"] }
            ]
          },
          {
            id: "term2",
            title: "Second Term",
            chapters: [
              { id: "b5", title: "Respiration in Plants", topics: ["Aerobic", "Anaerobic"] },
              { id: "b6", title: "Five Kingdom Classification", topics: ["Monera", "Protista", "Fungi", "Plantae", "Animalia"] },
              { id: "b10", title: "Diseases", topics: ["Causes", "Control"] }
            ]
          }
        ]
      },
      {
        id: "icse9_history",
        name: "History & Civics",
        units: [
          {
            id: "civics",
            title: "Civics",
            chapters: [
              { id: "hc1", title: "Our Constitution", topics: ["Preamble", "Fundamental Rights"] },
              { id: "hc2", title: "Elections", topics: ["Election Commission", "Direct/Indirect"] }
            ]
          },
          {
            id: "history",
            title: "History",
            chapters: [
              { id: "h1", title: "Harappan Civilization", topics: ["Sources", "Town Planning"] },
              { id: "h2", title: "Vedic Period", topics: ["Socio-Economic Life", "Vedas"] },
              { id: "h7", title: "Medieval India", topics: ["The Cholas", "Delhi Sultanate", "Mughal Empire"] }
            ]
          }
        ]
      },
      {
        id: "icse9_geography",
        name: "Geography",
        units: [
          {
            id: "g1",
            title: "Our World",
            chapters: [
              { id: "geo1", title: "Earth as a Planet", topics: ["Shape", "Size", "Proof"] },
              { id: "geo2", title: "Geographic Grid", topics: ["Latitude", "Longitude"] },
              { id: "geo3", title: "Rotation & Revolution", topics: ["Effects", "Seasons"] }
            ]
          },
          {
            id: "g2",
            title: "Structure of the Earth",
            chapters: [
              { id: "geo4", title: "Rocks", topics: ["Igneous", "Sedimentary", "Metamorphic"] },
              { id: "geo5", title: "Earthquakes", topics: ["Causes", "Measurement"] },
              { id: "geo6", title: "Pollutions", topics: ["Air", "Water", "Soil"] }
            ]
          }
        ]
      }
    ]
  },
  "Class 11": {
    "NEET": [
      {
        id: "neet11_physics",
        name: "Physics",
        units: [
          {
            id: "mechanics",
            title: "Mechanics",
            chapters: [
              { 
                id: "p1", 
                title: "Physics and Measurement",
                topics: ["Units and Dimensions", "Significant Figures", "Error Analysis", "Dimensional Analysis"]
              },
              { 
                id: "p2", 
                title: "Kinematics",
                topics: ["Motion in a Straight Line", "Vectors", "Projectile Motion", "Relative Velocity"]
              }
            ]
          }
        ]
      }
    ],
    "JEE": [
       {
        id: "jee11_maths",
        name: "Mathematics",
        units: [
          {
            id: "algebra",
            title: "Algebra",
            chapters: [
               { id: "m1", title: "Sets, Relations, Functions", topics: ["Sets", "Relations", "Functions"] }
            ]
          }
        ]
      }
    ]
  },
  "Class 12": {
    "ISC": [
       {
        id: "isc12_physics",
        name: "Physics",
        units: [
          {
            id: "electrostatics",
            title: "Electrostatics",
            chapters: [
              { id: "isc12_p1", title: "Electric Charges and Fields", topics: ["Coulomb's Law", "Electric Field", "Gauss Law"] }
            ]
          }
        ]
      }
    ]
  }
};
