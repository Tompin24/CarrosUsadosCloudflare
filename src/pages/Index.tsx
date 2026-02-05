import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCars } from "@/hooks/useCars";
import { CarCard } from "@/components/cars/CarCard";
import { Layout } from "@/components/layout/Layout";
import { SEOHead, OrganizationJsonLd } from "@/components/seo";
import { Search, Car, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL ? window.location.origin : "https://carrosusados.pt";

const Index = () => {
  const [search, setSearch] = useState("");
  const { data: cars, isLoading } = useCars();
  const featuredCars = cars?.slice(0, 6) || [];

  return (
    <Layout>
      <SEOHead
        title="Compra e Venda de Carros Usados em Portugal"
        description="Encontre milhares de carros usados de qualidade de vendedores de confiança. Pesquise veículos por marca, preço e localização. O marketplace de carros em Portugal."
        canonicalUrl={BASE_URL}
        ogType="website"
      />
      <OrganizationJsonLd url={BASE_URL} />
      {/* Hero Section */}
      <section className="bg-hero-gradient text-primary-foreground py-20 lg:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Bem-vindo ao <span className="text-secondary">Carros Usados.pt</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Milhares de veículos de qualidade de vendedores de confiança. Compre e venda com confiança.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar carros..."
                  className="pl-12 h-14 bg-card text-foreground border-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Link to={`/carros${search ? `?search=${search}` : ""}`}>
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Pesquisar
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Car, title: "Grande Variedade", desc: "Pesquise milhares de veículos de qualidade" },
              { icon: Shield, title: "Vendedores de Confiança", desc: "Anúncios verificados de proprietários reais" },
              { icon: Zap, title: "Processo Fácil", desc: "Anuncie o seu carro em minutos" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 p-6 bg-card rounded-xl shadow-card"
              >
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Anúncios Recentes</h2>
            <Link to="/carros">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Ainda não há carros anunciados. Seja o primeiro a vender!</p>
              <Link to="/carros/novo" className="mt-4 inline-block">
                <Button variant="hero">Vender o Seu Carro</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
