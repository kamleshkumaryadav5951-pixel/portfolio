import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, GitBranch, ExternalLink, Code2, Terminal, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';
import heroImage from '../assets/hero.png';



const skills = [
  { name: 'Data Structures & Algorithms', icon: <Terminal className="h-5 w-5" /> },
  { name: 'Full-Stack Web Development', icon: <Code2 className="h-5 w-5" /> },
  { name: 'System Design & Architecture', icon: <Database className="h-5 w-5" /> }
];

export const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full text-sm font-medium mb-4 ring-1 ring-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Open to new opportunities</span>
            </div>
            
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 mb-6 bg-muted">
              <img src={heroImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
              Building Digital <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Experiences & Systems
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              I'm Kamlesh, a full-stack developer & DSA enthusiast creating modern platforms and sharing knowledge through high-quality structured notes.
            </p>
            <div className="flex justify-center items-center gap-4 pt-4">
              <a href="https://github.com/kamleshkumaryadav5951-pixel" target="_blank" rel="noreferrer">
                <Button className="gap-2 group">
                  <GitBranch className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                  GitHub
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/kamlesh-kumar-yadav-235210303" target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 group border-border">
                  LinkedIn
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-colors"
               >
                 <div className="p-3 bg-primary/10 text-primary rounded-xl">
                   {skill.icon}
                 </div>
                 <h3 className="font-semibold text-foreground">{skill.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};
