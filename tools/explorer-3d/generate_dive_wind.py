#!/usr/bin/env python3
"""Génère la rafale originale de la cinématique Explorer."""
import math
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "assets/sounds/dive.m4a"
SAMPLE_RATE = 48_000
DURATION = 3.0
PEAK = 10 ** (-6 / 20)
SEED = 0x57494E44


def pink_brown_noise(samples: int) -> np.ndarray:
    """Produit un bruit rose-brun reproductible."""
    rng = np.random.default_rng(SEED)
    white = rng.standard_normal(samples)
    spectrum = np.fft.rfft(white)
    frequencies = np.fft.rfftfreq(samples, 1 / SAMPLE_RATE)
    scale = np.ones_like(frequencies)
    scale[1:] = 0.72 / np.sqrt(frequencies[1:]) + 0.28 / frequencies[1:]
    spectrum *= scale
    noise = np.fft.irfft(spectrum, n=samples)
    return noise / np.sqrt(np.mean(noise * noise))


def swept_bandpass(source: np.ndarray) -> np.ndarray:
    """Balaye le bruit dans une bande de fréquences douce."""
    output = np.empty_like(source)
    state_1 = 0.0
    state_2 = 0.0
    quality = 0.9
    for index, sample in enumerate(source):
        time = index / SAMPLE_RATE
        if time <= 1.4:
            frequency = 200 + 1300 * (time / 1.4)
        else:
            frequency = 1500 - 850 * ((time - 1.4) / (DURATION - 1.4))
        omega = 2 * math.pi * frequency / SAMPLE_RATE
        alpha = math.sin(omega) / (2 * quality)
        a0 = 1 + alpha
        b0 = alpha / a0
        b2 = -alpha / a0
        a1 = -2 * math.cos(omega) / a0
        a2 = (1 - alpha) / a0
        filtered = b0 * sample + state_1
        state_1 = -a1 * filtered + state_2
        state_2 = b2 * sample - a2 * filtered
        output[index] = filtered
    return output


def render() -> None:
    """Génère le souffle mono AAC avec des fondus sans clic."""
    samples = int(SAMPLE_RATE * DURATION)
    time = np.arange(samples, dtype=np.float64) / SAMPLE_RATE
    envelope = np.empty_like(time)
    rising = time <= 1.4
    envelope[rising] = np.sin((math.pi / 2) * time[rising] / 1.4) ** 2
    envelope[~rising] = np.cos(
        (math.pi / 2) * (time[~rising] - 1.4) / (DURATION - 1.4)
    ) ** 2
    audio = swept_bandpass(pink_brown_noise(samples)) * envelope
    audio *= PEAK / np.max(np.abs(audio))
    pcm = np.round(np.clip(audio, -1, 1) * 32767).astype('<i2')
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="explorer-wind-") as temporary:
        wav_path = Path(temporary) / "dive.wav"
        with wave.open(str(wav_path), "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SAMPLE_RATE)
            wav.writeframes(pcm.tobytes())
        subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-loglevel",
                "error",
                "-y",
                "-i",
                str(wav_path),
                "-map_metadata",
                "-1",
                "-c:a",
                "aac",
                "-b:a",
                "64k",
                "-ac",
                "1",
                str(OUTPUT),
            ],
            check=True,
        )
    print(f"Créé {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size} octets)")


if __name__ == "__main__":
    render()
