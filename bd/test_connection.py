"""
Test script to diagnose Supabase connection issues.
"""
import os
import socket
from pathlib import Path

from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent / "app" / ".env"
load_dotenv(dotenv_path=env_path)

db_url = os.getenv("database_url")
print(f"1. Environment variable loaded: {db_url is not None}")

if db_url:
    # Parse the URL
    print(f"\n2. Database URL format check:")
    if db_url.startswith("postgresql://"):
        print("   ✓ Valid PostgreSQL URL")
        
        # Extract hostname
        try:
            # Format: postgresql://user:pass@host:port/db
            host_part = db_url.split("@")[1].split(":")[0]
            print(f"   Host: {host_part}")
            
            # Test DNS resolution
            print(f"\n3. Testing DNS resolution...")
            try:
                ip_address = socket.gethostbyname(host_part)
                print(f"   ✓ DNS resolved to: {ip_address}")
            except socket.gaierror as e:
                print(f"   ✗ DNS resolution failed: {e}")
                print("\n   Troubleshooting steps:")
                print("   - Check your internet connection")
                print("   - Try flushing DNS: ipconfig /flushdns")
                print("   - Check if VPN/Firewall is blocking")
                print("   - Verify Supabase database is not paused")
            
            # Test port connection
            print(f"\n4. Testing port 5432 connectivity...")
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            try:
                result = sock.connect_ex((host_part, 5432))
                if result == 0:
                    print("   ✓ Port 5432 is reachable")
                else:
                    print(f"   ✗ Cannot connect to port 5432 (error code: {result})")
            except Exception as e:
                print(f"   ✗ Connection test failed: {e}")
            finally:
                sock.close()
                
        except Exception as e:
            print(f"   ✗ Failed to parse URL: {e}")
    else:
        print("   ✗ Not a PostgreSQL URL")
        
    # Test psycopg2 connection
    print(f"\n5. Testing psycopg2 connection...")
    try:
        import psycopg2
        conn = psycopg2.connect(db_url, connect_timeout=10)
        print("   ✓ Successfully connected to database!")
        conn.close()
    except ImportError:
        print("   ✗ psycopg2 not installed")
    except Exception as e:
        print(f"   ✗ Connection failed: {e}")
        
else:
    print("   ✗ DATABASE_URL not found in environment")
