import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 

// Criação do client Supabase com ordem correta dos parâmetros
export const supabase = createClient<Database>(supabaseUrl, supabaseKey!);

// Função aprimorada para buscar coleções
export async function getCollections({
    select = '*',
    filter = {},
}: {
    select?: string
    filter?: Record<string, any>
} = {}): Promise<any[] | null> {
    let query = supabase.from('collections').select(select)
    // Aplicar filtros se fornecidos
    for (const key in filter) {
        query = query.eq(key, filter[key])
    }
    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data
}

// Função para buscar coleções por creator
export async function getCollectionsByCreator(creator: string): Promise<any[] | null> {
    return getCollections({ filter: { creator } })
}

export async function getCollectionById(id: string): Promise<any | null> {
    const data = await getCollections({ filter: { id: Number(id) } })
    return data && data.length > 0 ? data[0] : null
}

// Função para inserir uma nova coleção
export async function insertCollection(collection: Partial<Database['public']['Tables']['collections']['Insert']>): Promise<any> {
    const { data, error } = await supabase
        .from('collections')
        .insert(collection as Database['public']['Tables']['collections']['Insert'])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}
