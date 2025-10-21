'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface Portfolio {
    id: string;
    title: string;
    slug: string;
}

interface Submission {
    id: string;
    submittedBy?: string;
    responses: Record<string, string>;
    completedAt: string;
    ipAddress?: string;
    portfolio: {
        title: string;
        slug: string;
    };
}

interface Question {
    id: string;
    step: number;
    title: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchSubmissions();
        }
    }, [selectedPortfolio, user]);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/admin/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        await Promise.all([fetchPortfolios(), fetchQuestions()]);
        setLoading(false);
    };

    const fetchPortfolios = async () => {
        try {
            const response = await fetch('/api/portfolios');
            const data = await response.json();
            if (response.ok) {
                setPortfolios(data.portfolios);
            }
        } catch (error) {
            console.error('Failed to fetch portfolios:', error);
        }
    };

    const fetchSubmissions = async () => {
        const token = localStorage.getItem('token');
        try {
            const url = selectedPortfolio === 'all' ? '/api/submissions' : `/api/submissions?portfolioId=${selectedPortfolio}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.submissions);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/questions');
            const data = await response.json();
            if (response.ok) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin/login');
    };

    const getQuestionTitle = (questionId: string) => {
        const question = questions.find((q) => q.id === questionId);
        return question ? question.title : questionId;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b-2 border-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-black">관리자 대시보드</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                                {user?.name} ({user?.role === 'SUPER_ADMIN' ? '최고 관리자' : '관리자'})
                            </span>
                            <button onClick={() => router.push('/')} className="px-4 py-2 bg-white text-black border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all">
                                메인 페이지
                            </button>
                            {user?.role === 'SUPER_ADMIN' && (
                                <button onClick={() => router.push('/admin/super')} className="px-4 py-2 bg-white text-black border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition-all">
                                    최고 관리자 페이지
                                </button>
                            )}
                            <button onClick={handleLogout} className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Portfolio Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-black mb-2">포트폴리오 필터</label>
                    <select value={selectedPortfolio} onChange={(e) => setSelectedPortfolio(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                        <option value="all">전체 포트폴리오</option>
                        {portfolios.map((portfolio) => (
                            <option key={portfolio.id} value={portfolio.id}>
                                {portfolio.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border-2 border-black rounded-lg p-6">
                        <div className="text-3xl font-bold text-black mb-2">{submissions.length}</div>
                        <div className="text-gray-600">제출 내역</div>
                    </div>
                    <div className="bg-white border-2 border-black rounded-lg p-6">
                        <div className="text-3xl font-bold text-black mb-2">{questions.length}</div>
                        <div className="text-gray-600">전체 질문</div>
                    </div>
                    <div className="bg-white border-2 border-black rounded-lg p-6">
                        <div className="text-3xl font-bold text-black mb-2">{portfolios.length}</div>
                        <div className="text-gray-600">포트폴리오</div>
                    </div>
                </div>

                {/* Submissions List */}
                <div className="bg-white border-2 border-black rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-black mb-6">제출 내역</h2>

                    {submissions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">아직 제출된 양식이 없습니다.</div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((submission) => (
                                <div key={submission.id} className="border-2 border-gray-300 rounded-lg p-4 hover:border-black transition-all cursor-pointer" onClick={() => setSelectedSubmission(submission)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-black">{submission.portfolio.title}</div>
                                            <div className="text-sm text-gray-600 mt-1">제출일: {new Date(submission.completedAt).toLocaleString('ko-KR')}</div>
                                            {submission.ipAddress && <div className="text-sm text-gray-500">IP: {submission.ipAddress}</div>}
                                        </div>
                                        <button className="text-sm text-black border-2 border-black px-3 py-1 rounded hover:bg-black hover:text-white transition-all">자세히 보기</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for viewing submission details */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border-2 border-black" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-black">제출 상세 내역</h3>
                            <button onClick={() => setSelectedSubmission(null)} className="text-2xl hover:text-gray-600">
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="text-sm text-gray-600">포트폴리오</div>
                                <div className="font-semibold">{selectedSubmission.portfolio.title}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">제출 ID</div>
                                <div className="font-mono">{selectedSubmission.id}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">제출일시</div>
                                <div>{new Date(selectedSubmission.completedAt).toLocaleString('ko-KR')}</div>
                            </div>
                            {selectedSubmission.ipAddress && (
                                <div>
                                    <div className="text-sm text-gray-600">IP 주소</div>
                                    <div>{selectedSubmission.ipAddress}</div>
                                </div>
                            )}

                            <div className="border-t-2 border-gray-200 pt-6">
                                <h4 className="font-bold text-lg mb-4">답변 내용</h4>
                                <div className="space-y-4">
                                    {Object.entries(selectedSubmission.responses).map(([questionId, answer]) => (
                                        <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="font-semibold text-black mb-2">{getQuestionTitle(questionId)}</div>
                                            <div className="text-gray-700 whitespace-pre-wrap">{answer}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
