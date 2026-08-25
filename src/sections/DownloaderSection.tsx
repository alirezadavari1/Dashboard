import { motion } from 'framer-motion'
import { Clapperboard, PlayCircle, Link2 } from 'lucide-react'
import DownloadBox from '../components/downloader/DownloadBox'
import ServerStatusBanner from '../components/downloader/ServerStatusBanner'

export default function DownloaderSection() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[13px] font-medium text-[var(--color-gold)]">دانلود آسان و سریع</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
          دانلودر
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-text-secondary)] max-w-lg">
          فایل‌های اینستاگرام، یوتیوب یا هر لینک مستقیمی را داخل همین صفحه دانلود کن.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <ServerStatusBanner />
      </motion.div>

      <div className="max-w-xl space-y-5">
        <DownloadBox
          title="دانلود از اینستاگرام"
          description="پست، ریلز یا استوری با لینک مستقیم"
          placeholder="https://www.instagram.com/reel/..."
          icon={Clapperboard}
          accentClass="text-[#e1306c]"
          accentBg="bg-[#e1306c]/10"
          mode="instagram"
          delay={0.1}
        />

        <DownloadBox
          title="دانلود از یوتیوب"
          description="ویدیو با بهترین کیفیت موجود"
          placeholder="https://www.youtube.com/watch?v=..."
          icon={PlayCircle}
          accentClass="text-[#ff0000]"
          accentBg="bg-[#ff0000]/10"
          mode="youtube"
          delay={0.18}
        />

        <DownloadBox
          title="دانلود مستقیم"
          description="هر لینکی که خودش لینک دانلود باشد"
          placeholder="https://example.com/file.zip"
          icon={Link2}
          accentClass="text-[var(--color-gold)]"
          accentBg="bg-[var(--color-gold)]/10"
          mode="direct"
          delay={0.26}
        />
      </div>
    </div>
  )
}
