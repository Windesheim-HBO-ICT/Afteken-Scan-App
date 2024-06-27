import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export type IDatabaseSchema = Record<string, object[]>;
interface IDatabase<Schema extends IDatabaseSchema> {
    setup(): Promise<void>;
    insert<T extends keyof Schema>(location: T, item: Schema[T][number]): Promise<void>;
    select<T extends keyof Schema>(location: T): Promise<Schema[T]>;
}

class Database<Schema extends IDatabaseSchema> implements IDatabase<Schema> {
    // The schema is a map of keys to arrays of objects
    // NOTE - The schema does not have all data, only a map of keys to empty arrays
    private schema: Schema;

    constructor(schema: Schema) {
        this.schema = schema;
        this.setup();
    }

    async setup(): Promise<void> {
        try {
            for (const [key, value] of Object.entries(this.schema)) {
                const storedItem = await AsyncStorage.getItem(key);

                if (!storedItem) {
                    // If item doesn't exist, store initial data
                    await AsyncStorage.setItem(key, JSON.stringify(value));
                } else {
                    // If item exists, combine with schema data
                    const data = JSON.parse(storedItem);

                    if (!Array.isArray(data)) {
                        throw new Error('Data must be an array');
                    }

                    // Combine the data from the schema and the data from AsyncStorage
                    const combinedData = [...value, ...data];
                    await AsyncStorage.setItem(key, JSON.stringify(combinedData));

                    // Clear the schema data
                    // @ts-ignore - Assuming you know this key exists in schema
                    this.schema[key] = [];
                }
            }
        } catch (error) {
            console.error('Error in setup:', error);
            throw error; // Rethrow the error to handle it outside
        }
    }

    async insert<T extends keyof Schema>(location: T, item: Schema[T][number]): Promise<void> {
        console.log('insert into:', location, 'The value:', item);
        if (typeof location !== 'string') {
            throw new Error('Location must be a string');
        }

        const data = JSON.parse(await AsyncStorage.getItem(location) || '[]');
        data.push(item);
        await AsyncStorage.setItem(location, JSON.stringify(data))
    }

    async select<T extends keyof Schema>(location: T): Promise<Schema[T]> {
        if (typeof location !== 'string') {
            throw new Error('Location must be a string');
        }

        return JSON.parse(await AsyncStorage.getItem(location) || '[]');
    }

    async exportToCsv<T extends keyof Schema>(location: T) {
        const data = await this.select(location);
        if (!data.length) {
            throw new Error('No data to export');
        }

        const header = Object.keys(data[0]).join(',');

        const csv = [header, ...data.map(data => {
            return Object.values(data).join(',');
        })].join('\n');

        try {
            // Generate filename based on location and current datetime
            const currentDatetime = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
            const filename = `${String(location)}_${currentDatetime}.csv`;

            // Write CSV data to a file in the app's cache directory
            const fileUri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

            // Depending on platform, handle file export
            if (Platform.OS === 'web') {
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            } else {
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw error;
        }
    }

    async clear() {
        await AsyncStorage.clear()
    }
}

export { Database };
