import { Sprout } from 'lucide-react';

interface HeaderProps {
  modelStatus: string;
}

function Header({ modelStatus }: HeaderProps) {
  const isModelReady = modelStatus === 'Model AI Siap';

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Sprout size={20} />
          <span>RootFacts</span>
        </div>

        <div className="status-pill">
          <span className={`status-dot ${isModelReady ? 'active' : ''}`}></span>
          <span>{modelStatus}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
