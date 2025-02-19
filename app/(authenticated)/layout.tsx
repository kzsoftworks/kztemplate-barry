import { ModeToggle } from '@/components/ui/mode-toggle';
import { NavItem } from '@/components/ui/nav-item';
import { SearchInput } from '@/components/ui/search';
import { User } from '@/components/ui/user';
import { Home, ShieldCheck } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            text-align: center;
          }
          .content {
            margin: 20px 0;
            padding: 20px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>Layout Page</h1>
          </div>
          <div className="content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
