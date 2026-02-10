'use client';

import { motion } from 'framer-motion';
import { Crown, Users, Star, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';
// Team member data
const founder = {
  name: 'Arjun Cattamanchi',
  role: 'Founder & Lead Developer',
  image: '/images/team/arjuncattamanchi.jpg',
  bio: 'A passionate STEM enthusiast dedicated to creating platforms that empower students to share their knowledge and discoveries.',
  quote:
    'Having attended school on either side of the US, I have yet to find a platform quite like STEM Magazine that provides a way to connect, foster discussion, and collaborate in STEM.',
};

const committeeLeaders = [
  {
    name: 'Leader One',
    role: 'Committee Co-Leader',
    image: '/images/team/leader1.jpg',
    bio: 'Passionate about fostering STEM education and building inclusive communities for young scientists.',
    quote:
      "STEM Magazine is where ideas come to life. It's more than a platform—it's a movement.",
  },
  {
    name: 'Leader Two',
    role: 'Committee Co-Leader',
    image: '/images/team/leader2.jpg',
    bio: 'Dedicated to empowering students to explore and share their STEM passions with the world.',
    quote:
      "Every article published here represents a student's curiosity and determination to learn.",
  },
];

const committeeMembers = [
  {
    name: 'Member One',
    role: 'Content Team',
    image: '/images/team/member1.jpg',
    bio: 'Helps curate and review submissions to ensure quality content.',
  },
  {
    name: 'Member Two',
    role: 'Design Team',
    image: '/images/team/member2.jpg',
    bio: "Creates visual assets and maintains the magazine's aesthetic.",
  },
  {
    name: 'Member Three',
    role: 'Outreach Team',
    image: '/images/team/member3.jpg',
    bio: 'Connects with students and promotes STEM Magazine initiatives.',
  },
  {
    name: 'Member Four',
    role: 'Content Team',
    image: '/images/team/member4.jpg',
    bio: 'Reviews and edits submissions for clarity and accuracy.',
  },
  {
    name: 'Member Five',
    role: 'Technical Team',
    image: '/images/team/member5.jpg',
    bio: "Supports the platform's technical infrastructure and features.",
  },
  {
    name: 'Member Six',
    role: 'Social Media Team',
    image: '/images/team/member6.jpg',
    bio: 'Manages social media presence and community engagement.',
  },
  {
    name: 'Member Seven',
    role: 'Events Team',
    image: '/images/team/member7.jpg',
    bio: 'Organizes STEM events and workshops for the community.',
  },
  {
    name: 'Member Eight',
    role: 'Outreach Team',
    image: '/images/team/member8.jpg',
    bio: 'Builds partnerships with schools and STEM organizations.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-(--background)">
      {/* Hero Section - using primary/accent gradient like contact section */}
      <div
        className="relative py-16 sm:py-24"
        style={{
          background:
            'linear-gradient(to bottom right, var(--primary), var(--accent))',
        }}
      >
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'var(--primary-foreground)',
              }}
            >
              <Sparkles className="h-4 w-4" />
              Meet the Team
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-poppins"
              style={{ color: 'var(--primary-foreground)' }}
            >
              The People Behind <br className="hidden sm:block" />
              STEM Magazine
            </h1>
            <p
              className="text-lg sm:text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--primary-foreground)', opacity: 0.9 }}
            >
              A dedicated team of students passionate about sharing knowledge,
              fostering curiosity, and building a community of young innovators.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {/* Founder Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="mb-16 sm:mb-24"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--accent)/20 text-(--accent-foreground) rounded-full text-sm font-semibold mb-4">
              <Crown className="h-4 w-4" />
              Founder & Lead Developer
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground) font-poppins">
              Visionary Leadership
            </h2>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-80 h-64 md:h-auto shrink-0">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(to bottom right, var(--primary), var(--accent))',
                  }}
                >
                  <span
                    className="text-6xl font-bold"
                    style={{ color: 'var(--primary-foreground)', opacity: 0.3 }}
                  >
                    {founder.name.charAt(0)}
                  </span>
                </div>
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-6 sm:p-8 md:p-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-(--foreground) mb-2">
                  {founder.name}
                </h3>
                <p className="text-(--primary) font-semibold mb-4">
                  {founder.role}
                </p>
                <p className="text-(--muted-foreground) mb-6">{founder.bio}</p>
                <blockquote className="relative pl-4 border-l-4 border-(--primary)">
                  <p className="text-(--foreground) italic">
                    &ldquo;{founder.quote}&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Committee Leaders Section 
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="mb-16 sm:mb-24"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--primary)/10 text-(--primary) rounded-full text-sm font-semibold mb-4">
              <Star className="h-4 w-4" />
              Committee Leaders
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground) font-poppins">
              Guiding the Team
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {committeeLeaders.map((leader, index) => (
              <motion.div
                key={leader.name}
                variants={itemVariants}
                className="bg-(--card) border border-(--border) rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-40 h-48 sm:h-auto shrink-0">
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background:
                          'linear-gradient(to bottom right, var(--primary), var(--accent))',
                      }}
                    >
                      <span
                        className="text-5xl font-bold"
                        style={{
                          color: 'var(--primary-foreground)',
                          opacity: 0.3,
                        }}
                      >
                        {leader.name.charAt(0)}
                      </span>
                    </div>
               
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover"
                    /> 
                  </div>
                  <div className="flex-1 p-5 sm:p-6">
                    <h3 className="text-xl font-bold text-(--foreground) mb-1">
                      {leader.name}
                    </h3>
                    <p className="text-(--primary) font-medium text-sm mb-3">
                      {leader.role}
                    </p>
                    <p className="text-sm text-(--muted-foreground) mb-4">
                      {leader.bio}
                    </p>
                    <blockquote className="text-sm italic text-(--foreground) border-l-2 border-(--primary) pl-3">
                      &ldquo;{leader.quote}&rdquo;
                    </blockquote>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        Committee Members Section 
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-(--muted) text-(--foreground) rounded-full text-sm font-semibold mb-4">
              <Users className="h-4 w-4" />
              Committee Members
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground) font-poppins">
              The Heart of the Team
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {committeeMembers.map((member, index) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-(--card) border border-(--border) rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(to bottom right, var(--primary), var(--accent))',
                    }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: 'var(--primary-foreground)',
                        opacity: 0.5,
                      }}
                    >
                      {member.name.charAt(0)}
                    </span>
                  </div>
                   Uncomment when image is available 
                   <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  /> 
                </div>
                <h3 className="font-bold text-(--foreground) mb-1">
                  {member.name}
                </h3>
                <p className="text-(--primary) text-sm font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-(--muted-foreground)">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        */}
        {/* Thank You Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 text-center"
        >
          <div className="bg-(--accent)/10 rounded-2xl p-8 sm:p-12 border border-(--border)">
            <Heart className="h-12 w-12 mx-auto text-(--primary) mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground) mb-4 font-poppins">
              Thank You for Being Part of Our Journey
            </h2>
            <p className="text-(--muted-foreground) max-w-2xl mx-auto">
              STEM Magazine wouldn&apos;t be possible without the dedication of
              our team and the support of our amazing community. Together,
              we&apos;re inspiring the next generation of scientists, engineers,
              and innovators.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
