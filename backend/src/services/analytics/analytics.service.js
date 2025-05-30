export class AnalyticsService {
    generatePaperTrends(papers) {
        const trends = {
            totalPapers: papers.length,
            topCategories: this.getTopCategories(papers),
            trendingKeywords: this.getTrendingKeywords(papers),
            publicationTimeline: this.getPublicationTimeline(papers),
            averageRelevanceScore: this.getAverageRelevance(papers),
            topAuthors: this.getTopAuthors(papers),
            summaryStats: this.getSummaryStats(papers)
        };
        return trends;
    }

    getTopCategories(papers) {
        const categoryCounts = {};
        papers.forEach(paper => {
            const category = paper.category || 'unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        return Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count, percentage: (count/papers.length * 100).toFixed(1) }));
    }

    getTrendingKeywords(papers) {
        const keywords = {};
        const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'using', 'based', 'via']);
        
        papers.forEach(paper => {
            const words = paper.title.toLowerCase().split(/\s+/);
            words.forEach(word => {
                word = word.replace(/[^a-z0-9]/g, '');
                if (word.length > 3 && !stopWords.has(word)) {
                    keywords[word] = (keywords[word] || 0) + 1;
                }
            });
        });
        
        return Object.entries(keywords)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));
    }

    getPublicationTimeline(papers) {
        const timeline = {};
        const now = new Date();
        
        papers.forEach(paper => {
            const date = new Date(paper.date);
            const daysAgo = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            let bucket;
            if (daysAgo === 0) bucket = 'Today';
            else if (daysAgo === 1) bucket = 'Yesterday';
            else if (daysAgo <= 7) bucket = 'This Week';
            else if (daysAgo <= 30) bucket = 'This Month';
            else bucket = 'Older';
            
            timeline[bucket] = (timeline[bucket] || 0) + 1;
        });
        
        return timeline;
    }

    getAverageRelevance(papers) {
        const relevantPapers = papers.filter(p => p.relevanceScore);
        if (relevantPapers.length === 0) return 0;
        
        const totalScore = relevantPapers.reduce((sum, p) => sum + p.relevanceScore, 0);
        return (totalScore / relevantPapers.length).toFixed(2);
    }

    getTopAuthors(papers) {
        const authorCounts = {};
        
        papers.forEach(paper => {
            if (paper.authors) {
                const authors = paper.authors.split(',').map(a => a.trim());
                authors.forEach(author => {
                    if (author) {
                        authorCounts[author] = (authorCounts[author] || 0) + 1;
                    }
                });
            }
        });
        
        return Object.entries(authorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([author, count]) => ({ author, count }));
    }

    getSummaryStats(papers) {
        const withSummaries = papers.filter(p => p.hasSummary).length;
        const avgTitleLength = papers.reduce((sum, p) => sum + p.title.length, 0) / papers.length;
        
        return {
            totalPapers: papers.length,
            papersWithSummaries: withSummaries,
            summaryPercentage: (withSummaries / papers.length * 100).toFixed(1),
            averageTitleLength: Math.round(avgTitleLength),
            dateRange: this.getDateRange(papers)
        };
    }

    getDateRange(papers) {
        if (papers.length === 0) return { start: null, end: null };
        
        const dates = papers.map(p => new Date(p.date)).sort((a, b) => a - b);
        return {
            start: dates[0].toISOString().split('T')[0],
            end: dates[dates.length - 1].toISOString().split('T')[0]
        };
    }

    exportAnalytics(trends) {
        return {
            generated: new Date().toISOString(),
            analytics: trends,
            version: '1.0'
        };
    }
}