# Examples

## Overview

Real-world examples demonstrating scripting capabilities.

## Content Generation

### Article Outline and Expansion

```bash
# Define the workflow functions
/func llm generateOutline($subject, $audience) => "Create a detailed article outline about $subject for $audience"
/func llm expandSection($outline, $section) => "Based on this outline: $outline, write a detailed section for: $section"

# Generate outline
/var $outline = generateOutline("machine learning", "beginners")
/echo $outline

# Expand sections
/var $intro = expandSection($outline, "Introduction")
/var $basics = expandSection($outline, "Basic Concepts")
/var $examples = expandSection($outline, "Practical Examples")
/var $conclusion = expandSection($outline, "Conclusion")

# Combine into full article
/var $article = "$intro\n\n$basics\n\n$examples\n\n$conclusion"
/echo $article
```

### Blog Post with Metadata

```bash
# Generate content
/var $topic = "sustainable technology"
/var $title = llm("Create a catchy title about $topic")
/var $content = llm("Write a 500-word blog post about $topic")
/var $tags = llm("Generate 5 relevant tags for an article about $topic")

# Add metadata
/func js timestamp() {
  return new Date().toISOString();
}

/func js formatPost($title, $content, $tags, $date) {
  return `---
title: ${$title}
date: ${$date}
tags: ${$tags}
---

${$content}`;
}

/var $date = timestamp()
/var $post = formatPost($title, $content, $tags, $date)
/echo $post
```

## Research Workflows

### Multi-Source Research

```bash
# Define research function
/func llm research($query, $source) => "Research $query using $source and provide key findings with citations"

# Gather information from multiple sources
/var $topic = "quantum computing applications"
/var $academic = research($topic, "academic papers")
/var $industry = research($topic, "industry reports")
/var $news = research($topic, "recent news articles")

# Synthesize findings
/var $synthesis = llm("Synthesize these research findings into a comprehensive report:\n\nAcademic: $academic\n\nIndustry: $industry\n\nNews: $news")
/echo $synthesis
```

### Comparative Analysis

```bash
# Define comparison function
/func llm compare($item1, $item2, $criteria) => "Compare $item1 and $item2 based on $criteria. Provide a detailed analysis."

# Research topics
/var $topic1 = "React"
/var $topic2 = "Vue"
/var $overview1 = llm("Provide an overview of $topic1")
/var $overview2 = llm("Provide an overview of $topic2")

# Compare on different criteria
/var $performance = compare($topic1, $topic2, "performance and speed")
/var $learning = compare($topic1, $topic2, "learning curve and documentation")
/var $ecosystem = compare($topic1, $topic2, "ecosystem and community support")

# Create final report
/var $report = llm("Create a comprehensive comparison report using these analyses:\n\nPerformance: $performance\n\nLearning: $learning\n\nEcosystem: $ecosystem")
/echo $report
```

## Data Processing

### Text Analysis Pipeline

```bash
# Define processing functions
/func js wordCount($text) {
  return $text.split(/\s+/).length;
}

/func js extractUrls($text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return ($text.match(urlRegex) || []).join('\n');
}

/func js extractEmails($text) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return ($text.match(emailRegex) || []).join('\n');
}

/func llm summarize($text) => "Provide a concise summary of: $text"
/func llm sentiment($text) => "Analyze the sentiment of this text (positive/negative/neutral): $text"

# Process document
/var $document = "Your long document text here..."

/var $words = wordCount($document)
/var $urls = extractUrls($document)
/var $emails = extractEmails($document)
/var $summary = summarize($document)
/var $sentiment = sentiment($document)

# Create analysis report
/echo Analysis Report:
/echo Word Count: $words
/echo URLs Found: $urls
/echo Emails Found: $emails
/echo Summary: $summary
/echo Sentiment: $sentiment
```

### CSV to JSON Conversion

```bash
/func js csvToJson($csv) {
  const lines = $csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || '';
      return obj;
    }, {});
  });
  return JSON.stringify(rows, null, 2);
}

/var $csv = "name,age,city
Alice,30,NYC
Bob,25,LA
Carol,35,SF"

/var $json = csvToJson($csv)
/echo $json
```

## Translation Workflows

### Multi-Language Translation

```bash
# Define translation function
/func llm translate($text, $lang) => "Translate the following text to $lang, maintaining the original tone and style: $text"

# Source content
/var $original = "Welcome to our platform. We're excited to have you here!"

# Translate to multiple languages
/var $spanish = translate($original, "Spanish")
/var $french = translate($original, "French")
/var $german = translate($original, "German")
/var $japanese = translate($original, "Japanese")

# Display results
/echo Original: $original
/echo Spanish: $spanish
/echo French: $french
/echo German: $german
/echo Japanese: $japanese
```

### Localization with Context

```bash
/func llm localize($text, $lang, $context) => "Localize this text for $lang speakers, considering $context: $text"

/var $message = "Your order has been shipped!"
/var $context = "e-commerce notification"

/var $es = localize($message, "Spanish", $context)
/var $fr = localize($message, "French", $context)
/var $de = localize($message, "German", $context)

/echo Spanish: $es
/echo French: $fr
/echo German: $de
```

## Content Transformation

### Markdown Formatting

```bash
/func js formatMarkdown($title, $content, $author) {
  const date = new Date().toLocaleDateString();
  return `# ${$title}

**Author:** ${$author}  
**Date:** ${date}

---

${$content}

---

*Generated with TokenRing Scripting*`;
}

/var $title = "My Article"
/var $content = llm("Write a short article about AI")
/var $author = "Alice"

/var $formatted = formatMarkdown($title, $content, $author)
/echo $formatted
```

### HTML Generation

```bash
/func js toHtml($title, $content) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${$title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>${$title}</h1>
  <div class="content">
    ${$content.split('\n').map(p => `<p>${p}</p>`).join('\n    ')}
  </div>
</body>
</html>`;
}

/var $title = "My Page"
/var $content = "Paragraph 1\nParagraph 2\nParagraph 3"
/var $html = toHtml($title, $content)
/echo $html
```

## Quality Assurance

### Content Review Pipeline

```bash
# Define review functions
/func llm checkGrammar($text) => "Review this text for grammar and spelling errors: $text"
/func llm checkClarity($text) => "Evaluate the clarity and readability of this text: $text"
/func llm checkTone($text, $target) => "Evaluate if this text matches the $target tone: $text"
/func llm suggest($text) => "Suggest improvements for this text: $text"

# Review content
/var $draft = "Your draft content here..."

/var $grammar = checkGrammar($draft)
/var $clarity = checkClarity($draft)
/var $tone = checkTone($draft, "professional and friendly")
/var $suggestions = suggest($draft)

# Compile review
/echo Grammar Check: $grammar
/echo Clarity Check: $clarity
/echo Tone Check: $tone
/echo Suggestions: $suggestions
```

### SEO Optimization

```bash
/func llm generateKeywords($content) => "Extract 10 relevant SEO keywords from: $content"
/func llm generateMeta($content) => "Generate a meta description (150-160 chars) for: $content"
/func llm generateTitle($content) => "Generate an SEO-optimized title (50-60 chars) for: $content"

/var $article = "Your article content..."

/var $keywords = generateKeywords($article)
/var $meta = generateMeta($article)
/var $title = generateTitle($article)

/echo SEO Title: $title
/echo Meta Description: $meta
/echo Keywords: $keywords
```

## Interactive Workflows

### Question-Answer Chain

```bash
# Define Q&A function
/func llm ask($question, $context) => "Based on this context: $context\n\nAnswer this question: $question"

# Build knowledge base
/var $topic = "machine learning"
/var $context = llm("Provide a comprehensive overview of $topic")

# Ask multiple questions
/var $q1 = ask("What are the main types?", $context)
/var $q2 = ask("What are common applications?", $context)
/var $q3 = ask("What are the challenges?", $context)

/echo Q1: $q1
/echo Q2: $q2
/echo Q3: $q3
```

### Iterative Refinement

```bash
# Generate initial draft
/var $topic = "climate change"
/var $draft1 = llm("Write a brief explanation of $topic")

# Refine iteratively
/var $draft2 = llm("Improve this explanation by adding more specific examples: $draft1")
/var $draft3 = llm("Make this explanation more accessible to a general audience: $draft2")
/var $final = llm("Polish this explanation for publication: $draft3")

/echo Final Version: $final
```

## Utility Scripts

### Date and Time Formatting

```bash
/func js now() {
  return new Date().toISOString();
}

/func js formatDate($iso, $format) {
  const date = new Date($iso);
  if ($format === 'short') return date.toLocaleDateString();
  if ($format === 'long') return date.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  return date.toString();
}

/var $timestamp = now()
/var $short = formatDate($timestamp, "short")
/var $long = formatDate($timestamp, "long")

/echo ISO: $timestamp
/echo Short: $short
/echo Long: $long
```

### Text Statistics

```bash
/func js stats($text) {
  const words = $text.split(/\s+/).length;
  const chars = $text.length;
  const sentences = $text.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordLength = ($text.replace(/\s/g, '').length / words).toFixed(2);
  
  return `Words: ${words}
Characters: ${chars}
Sentences: ${sentences}
Avg Word Length: ${avgWordLength}`;
}

/var $text = "Your text here. Multiple sentences! How many?"
/var $statistics = stats($text)
/echo $statistics
```

## Next Steps

- [Advanced Topics](06-advanced.md) - Complex patterns and techniques
- [Developer Guide](07-developer-guide.md) - Creating global functions
