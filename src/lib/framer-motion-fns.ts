export const fadeInLeft = {
      initial: { opacity: 0, x: '50%' },
      whileInView: { opacity: 1, x: '0' },
      viewport: { once: true },
      transition: { ease: 'circOut', duration: 1 },
    }

export const fadeInRight = {
      initial: { opacity: 0, x: '-50%' },
      whileInView: { opacity: 1, x: '0' },
      viewport: { once: true },
      transition: { ease: 'circOut', duration: 1 },
    };