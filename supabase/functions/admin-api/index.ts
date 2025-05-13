import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/admin-api', '');

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user || user.email !== 'mk@powerhouse.com') {
      throw new Error('Unauthorized');
    }

    // Handle different endpoints
    switch (path) {
      case '/trainees':
        return handleTrainees(req, supabaseClient);
      
      case '/exercises':
        return handleExercises(req, supabaseClient);
      
      case '/meals':
        return handleMeals(req, supabaseClient);
      
      case '/memberships':
        return handleMemberships(req, supabaseClient);
      
      case '/notifications':
        return handleNotifications(req, supabaseClient);
      
      case '/stats':
        return handleStats(req, supabaseClient);

      case '/settings':
      case '/settings/general':
      case '/settings/security':
      case '/settings/notifications':
      case '/settings/appearance':
        return handleSettings(req, supabaseClient, path);
      
      default:
        throw new Error('Endpoint not found');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleTrainees(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('trainee_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'POST': {
      const trainee = await req.json();
      const { data, error } = await supabase
        .from('trainee_profiles')
        .insert([trainee])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'PUT': {
      const trainee = await req.json();
      const { data, error } = await supabase
        .from('trainee_profiles')
        .update(trainee)
        .eq('id', trainee.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'DELETE': {
      const { id } = await req.json();
      const { error } = await supabase
        .from('trainee_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        null,
        { headers: corsHeaders }
      );
    }

    default:
      throw new Error('Method not allowed');
  }
}

async function handleExercises(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'POST': {
      const exercise = await req.json();
      const { data, error } = await supabase
        .from('exercises')
        .insert([exercise])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'PUT': {
      const exercise = await req.json();
      const { data, error } = await supabase
        .from('exercises')
        .update(exercise)
        .eq('id', exercise.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'DELETE': {
      const { id } = await req.json();
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        null,
        { headers: corsHeaders }
      );
    }

    default:
      throw new Error('Method not allowed');
  }
}

async function handleMeals(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'POST': {
      const meal = await req.json();
      const { data, error } = await supabase
        .from('meals')
        .insert([meal])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'PUT': {
      const meal = await req.json();
      const { data, error } = await supabase
        .from('meals')
        .update(meal)
        .eq('id', meal.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'DELETE': {
      const { id } = await req.json();
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        null,
        { headers: corsHeaders }
      );
    }

    default:
      throw new Error('Method not allowed');
  }
}

async function handleMemberships(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'POST': {
      const membership = await req.json();
      const { data, error } = await supabase
        .from('memberships')
        .insert([membership])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'PUT': {
      const membership = await req.json();
      const { data, error } = await supabase
        .from('memberships')
        .update(membership)
        .eq('id', membership.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'DELETE': {
      const { id } = await req.json();
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        null,
        { headers: corsHeaders }
      );
    }

    default:
      throw new Error('Method not allowed');
  }
}

async function handleNotifications(req: Request, supabase: any) {
  const method = req.method;

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'POST': {
      const notification = await req.json();
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    case 'PUT': {
      const notification = await req.json();
      const { data, error }
    }
  }
}