import HeroSearchBar from './components/HeroSearchBar';
import TutorSections from './components/TutorSections';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative rounded-2xl overflow-hidden px-8 py-14 text-white" style={{ backgroundColor: '#1e3a5f' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #e05a2b 0%, transparent 60%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 50%)', opacity: 0.25 }} />
        <div className="relative max-w-lg">
          <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>TutorMatch</p>
          <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: '#ffffff' }}>나에게 맞는 악기 튜터를<br />지금 바로 찾아보세요</h1>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>피아노, 기타, 바이올린, 보컬까지 — 검증된 튜터와 1:1 맞춤 레슨을 시작하세요.</p>
          <HeroSearchBar />
        </div>
      </section>

      <TutorSections />
    </div>
  );
}
