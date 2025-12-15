import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <main className="w-full max-w-3xl px-4 py-8">
                <RegisterForm />
            </main>
        </div>
    );
}

