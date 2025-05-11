// No need to import getSupabaseClient since we're not using it
export async function signInAdmin(email: string, password: string) {
    // Check if the email and password match the environment variables
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('Admin credentials not configured');
    }
    
    if (email === adminEmail && password === adminPassword) {
      return { user: { email } };
    } else {
      throw new Error('Invalid login credentials');
    }
  }
  
  export async function signOutAdmin() {
    // Simple sign out - just returns success
    return { success: true };
  }
  
  export async function getAdminSession() {
    // Check if there's a session in localStorage
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('cpa_dashboard_auth');
      if (isLoggedIn === 'true') {
        return { user: { email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL } };
      }
    }
    return null;
  }