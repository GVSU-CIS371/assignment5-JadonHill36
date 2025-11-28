import { defineStore } from "pinia";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { type User } from "firebase/auth";

interface Beverage {
  id?: string;
  uid: string;
  name: string;
  base: string;
  creamer: string;
  syrup: string;
  temperature: string;
  createdAt: number;
}

export const COLORS: Record<string, string> = {
  Coffee: "#6F4E37",
  "Black Tea": "#2E1F0E",
  "Green Tea": "#4CAF50",
  Milk: "#F0F8FF",
  Cream: "#FFFACD",
  "Half & Half": "#FAFAD2",
  Vanilla: "#FFEFD5",
  Caramel: "#DAA520",
  Hazelnut: "#6B4423",
  "No Cream": "transparent",
  "No Syrup": "transparent"
};

export const useBeverageStore = defineStore("beverageStore", {
  state: () => ({
    user: null as User | null,
    bases: [] as string[],
    creamers: [] as string[],
    syrups: [] as string[],
    temperatures: ["Hot", "Cold"],

    currentBase: "",
    currentCreamer: "",
    currentSyrup: "",
    currentTemperature: "Hot",

    beverages: [] as Beverage[],
    currentBeverage: null as Beverage | null,
    newName: "",
    unsubscribe: null as null | (() => void)
  }),

  actions: {
    async loadIngredients() {
      onSnapshot(collection(db, "bases"), (snap) => {
        this.bases = snap.docs.map(d => d.data().name as string);
        if (!this.currentBase) this.currentBase = this.bases[0] || "";
      });

      onSnapshot(collection(db, "creamers"), (snap) => {
        this.creamers = snap.docs.map(d => d.data().name as string);
        if (!this.currentCreamer) this.currentCreamer = this.creamers[0] || "";
      });

      onSnapshot(collection(db, "syrups"), (snap) => {
        this.syrups = snap.docs.map(d => d.data().name as string);
        if (!this.currentSyrup) this.currentSyrup = this.syrups[0] || "";
      });
    },

    setUser(user: User | null) {
      this.user = user;

      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        return;
      }

      const q = query(collection(db, "beverages"), where("uid", "==", user.uid));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.beverages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Beverage)
        }));

        if (this.beverages.length > 0) {
          const b = this.beverages[0];
          this.currentBeverage = b;
          this.currentBase = b.base;
          this.currentCreamer = b.creamer;
          this.currentSyrup = b.syrup;
          this.currentTemperature = b.temperature;
        }
      });
    },

    async makeBeverage() {
      if (!this.user) return "No user logged in.";
      if (!this.newName.trim()) return "Please enter a name.";

      const beverage: Beverage = {
        uid: this.user.uid,
        name: this.newName.trim(),
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
        temperature: this.currentTemperature,
        createdAt: Date.now()
      };

      await addDoc(collection(db, "beverages"), beverage);
      this.newName = "";
      return `Beverage ${beverage.name} created.`;
    },

    showBeverage(name: string) {
      const b = this.beverages.find(x => x.name === name);
      if (!b) return;

      this.currentBeverage = b;
      this.currentBase = b.base;
      this.currentCreamer = b.creamer;
      this.currentSyrup = b.syrup;
      this.currentTemperature = b.temperature;
    },

    setBase(x: string) {
      this.currentBase = x;
    },
    setCreamer(x: string) {
      this.currentCreamer = x;
    },
    setSyrup(x: string) {
      this.currentSyrup = x;
    },
    setTemperature(x: string) {
      this.currentTemperature = x;
    }
  },

  getters: {
    dynamicHeights: (state) => {
      const CREAMER_HEIGHT = 20;
      const SYRUP_HEIGHT = 10;
      const hasCreamer = state.currentCreamer !== "No Cream";
      const hasSyrup = state.currentSyrup !== "No Syrup";

      const visibleCreamer = hasCreamer ? CREAMER_HEIGHT : 0;
      const visibleSyrup = hasSyrup ? SYRUP_HEIGHT : 0;
      const baseHeight = 100 - visibleCreamer - visibleSyrup;

      return {
        creamer: `${visibleCreamer}%`,
        syrup: `${visibleSyrup}%`,
        base: `${baseHeight}%`,
        isCreamerVisible: hasCreamer,
        isSyrupVisible: hasSyrup
      };
    }
  }
});