import { BatteryCharging, Camera, ChevronRight, Medal, MonitorSmartphone, Trophy } from "lucide-react";
import type { RankedPhone } from "@/lib/types";
import { ScoreRing } from "./score-ring";

export function PhoneCard({ phone, position, onDetail }: { phone: RankedPhone; position: number; onDetail: () => void }) {
  return (
    <article className={`podium-card rank-${position}`}>
      <div className="podium-top"><span className="rank-badge">{position === 1 ? <Trophy /> : <Medal />} #{phone.rank}</span><span className="market-badge">{phone.market}</span></div>
      <div className="podium-main"><div><span className="brand-name">{phone.brand}</span><h2>{phone.name}</h2><p>{phone.performance.chipset}</p></div><ScoreRing value={phone.total} /></div>
      <div className="mini-specs">
        <span><BatteryCharging />{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh</span>
        <span><Camera />{phone.camera.mainMP} Mpx{phone.camera.teleZoom ? ` · ${phone.camera.teleZoom}×` : ""}</span>
        <span><MonitorSmartphone />{phone.screen.refreshHz} Hz</span>
      </div>
      <button className="detail-link" onClick={onDetail}>Voir le détail <ChevronRight /></button>
    </article>
  );
}
