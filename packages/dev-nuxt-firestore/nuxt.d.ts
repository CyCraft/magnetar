declare module '#app' {
  interface NuxtApp {
    payload: {
      // add payload for magnetar SSR
      magnetar: Record<string, any>
    }
  }
}

export {}
