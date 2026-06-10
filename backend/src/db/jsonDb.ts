import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(__dirname, '../../data/localdb.json');

interface LocalDBData {
  users: any[];
  predictions: any[];
  crops: any[];
}

class JSONDatabase {
  private data: LocalDBData = { users: [], predictions: [], crops: [] };

  async initialize() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.predictions) this.data.predictions = [];
        if (!this.data.crops) this.data.crops = [];
      } catch (e) {
        console.error('Error reading localdb.json, resetting database:', e);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to localdb.json:', e);
    }
  }

  getCollection(name: keyof LocalDBData) {
    const self = this;
    return {
      find: async (filter?: any) => {
        let items = self.data[name];
        if (filter) {
          items = items.filter(item => {
            for (const key in filter) {
              // Handle simple array inclusion or direct equality
              if (Array.isArray(filter[key])) {
                if (!filter[key].includes(item[key])) return false;
              } else if (typeof filter[key] === 'object' && filter[key] !== null) {
                // Handle basic regex search or other operators if needed
                const op = Object.keys(filter[key])[0];
                const val = filter[key][op];
                if (op === '$regex') {
                  const regex = new RegExp(val, 'i');
                  if (!regex.test(item[key])) return false;
                } else if (op === '$ne') {
                  if (item[key] === val) return false;
                }
              } else {
                if (item[key] !== filter[key]) return false;
              }
            }
            return true;
          });
        }
        // Return duplicate objects to mock MongoDB database detachment
        return JSON.parse(JSON.stringify(items));
      },
      findOne: async (filter: any) => {
        const items = self.data[name];
        const found = items.find(item => {
          for (const key in filter) {
            if (item[key] !== filter[key]) return false;
          }
          return true;
        });
        return found ? JSON.parse(JSON.stringify(found)) : null;
      },
      findById: async (id: string) => {
        const items = self.data[name];
        const found = items.find(item => item._id === id);
        return found ? JSON.parse(JSON.stringify(found)) : null;
      },
      create: async (doc: any) => {
        const newDoc = {
          _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          ...doc
        };
        self.data[name].push(newDoc);
        self.save();
        return JSON.parse(JSON.stringify(newDoc));
      },
      findByIdAndUpdate: async (id: string, update: any) => {
        const items = self.data[name];
        const index = items.findIndex(item => item._id === id);
        if (index === -1) return null;
        
        const current = items[index];
        // Merge updates
        const updated = { ...current, ...update, updatedAt: new Date().toISOString() };
        items[index] = updated;
        self.save();
        return JSON.parse(JSON.stringify(updated));
      },
      findByIdAndDelete: async (id: string) => {
        const items = self.data[name];
        const index = items.findIndex(item => item._id === id);
        if (index === -1) return null;
        const deleted = items.splice(index, 1)[0];
        self.save();
        return JSON.parse(JSON.stringify(deleted));
      },
      // Pagination helper for local DB
      findPaginated: async (filter: any, skip: number, limit: number, sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') => {
        let items = self.data[name];
        if (filter) {
          items = items.filter(item => {
            for (const key in filter) {
              if (typeof filter[key] === 'object' && filter[key] !== null) {
                const op = Object.keys(filter[key])[0];
                const val = filter[key][op];
                if (op === '$regex') {
                  const regex = new RegExp(val, 'i');
                  if (!regex.test(item[key])) return false;
                }
              } else if (item[key] !== filter[key]) {
                return false;
              }
            }
            return true;
          });
        }
        
        // Sort
        items.sort((a: any, b: any) => {
          const valA = a[sortBy] || '';
          const valB = b[sortBy] || '';
          if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
          if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });

        const total = items.length;
        const paginatedItems = items.slice(skip, skip + limit);
        return {
          items: JSON.parse(JSON.stringify(paginatedItems)),
          total
        };
      }
    };
  }
}

export const localDb = new JSONDatabase();
export type JSONDbCollection = ReturnType<typeof localDb.getCollection>;
