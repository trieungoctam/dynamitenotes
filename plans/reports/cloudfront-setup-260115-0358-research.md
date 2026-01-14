# CloudFront CDN Setup for S3-Hosted Images

**Report Date:** 2025-01-15
**Status:** Complete

## 1. CloudFront Distribution Setup with S3 Origin

### Core Configuration

**Origin Setup:**
- Use S3 bucket regional domain name: `bucket-name.s3.region.amazonaws.com`
- Enable Origin Access Control (OAC) - **preferred over OAI** for new distributions
- Block all public access on S3 bucket, allow only via CloudFront OAC
- Use S3 REST API endpoint (not website endpoint) for HTTPS support

**Distribution Settings:**
- Viewer Protocol Policy: `redirect-to-https` or `https-only`
- Allowed Methods: GET, HEAD (for images)
- HTTP Version: HTTP/2 and HTTP/3 (enabled by default in 2025)
- IPv6: Enabled
- compress: true (for text-based formats)

### CloudFormation Template

```yaml
Resources:
  ImageBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  OriginAccessControl:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Name: image-s3-oac
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: ""
        HttpVersion: http2and3
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt ImageBucket.RegionalDomainName
            OriginAccessControlId: !Ref OriginAccessControl
            ConnectionAttempts: 3
            ConnectionTimeout: 10
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6  # CachingOptimized
          OriginRequestPolicyId: 88a5eaf4-2fd4-4709-b370-b4c650ea3fcf  # CORS-S3Origin
          Compress: true
        PriceClass: PriceClass_100  # US/Canada/Europe (most cost-effective)
        ViewerCertificate:
          CloudFrontDefaultCertificate: true

  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref ImageBucket
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub ${ImageBucket.Arn}/*
            Condition:
              StringEquals:
                AWS:SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${CloudFrontDistribution}
```

### Terraform Alternative

```hcl
resource "aws_cloudfront_distribution" "images" {
  enabled             = true
  http_version        = "http2and3"
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id   = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "S3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"  # CachingOptimized
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"  # CORS-S3Origin
  }
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "s3-images-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

## 2. Caching Strategies for Images

### Cache Policy Configuration

**Managed Cache Policies:**
- `CachingOptimized` (ID: `658327ea-f89d-4fab-a63d-7e88639e58f6`)
  - Min TTL: 0
  - Default TTL: 86400 (1 day)
  - Max TTL: 31536000 (1 year)
  - No query string forwarding
  - No cookies
  - **Best for:** Static images with immutable filenames

**Custom Cache Policies:**
```yaml
# For versioned images (immutable)
ImageCachePolicy:
  Type: AWS::CloudFront::CachePolicy
  Properties:
    CachePolicyConfig:
      Name: ImmutableImages
      DefaultTTL: 31536000  # 1 year
      MaxTTL: 31536000
      MinTTL: 31536000
      ParametersInCacheKeyAndForwardedToOrigin:
        EnableAcceptEncodingGzip: true
        EnableAcceptEncodingBrotli: true
        CookiesConfig:
          CookieBehavior: none
        QueryStringsConfig:
          QueryStringBehavior: none
        HeadersConfig:
          HeaderBehavior: none
```

### Caching Best Practices

1. **Version-Based Cache Busting**
   - Use content hash in filename: `image-abc123.jpg`
   - Set long TTLs (1 year)
   - Never invalidate - upload new versions with new names

2. **Cache-Control Headers at Origin**
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

3. **URL-Based Variants**
   - `/images/thumbnail/photo.jpg`
   - `/images/original/photo.jpg`
   - Each path = separate cache entry

4. **Origin Shield** (optional, for high traffic)
   - Additional caching layer between edge and origin
   - Reduces origin load by 90%+ during spikes
   - Regional edge caching enabled automatically

## 3. Cache Invalidation Methods

### Recommended Strategy: Avoid Invalidation

**Best Practice:** Don't invalidate. Use versioning:
- Upload new files with unique names (hash/version in path)
- Update references in application
- Old versions expire naturally

### When Invalidation Is Necessary

**Invalidation Methods:**

1. **Individual Object Invalidation**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E1234ABCD \
     --paths "/images/updated-image.jpg"
   ```

2. **Wildcard Invalidation** (use sparingly)
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id E1234ABCD \
     --paths "/images/*"
   ```

**Cost:** $0.005 per invalidation path (first 1000 free/month)

**Propagation Time:**
- Individual files: 1-3 minutes
- Wildcard (`/*`): 5-15 minutes

**Batching Tips:**
- Group invalidations (up to 1000 paths per request)
- Use wildcards instead of multiple individual paths
- Invalidate during low-traffic periods

## 4. Custom Domain Setup with SSL/TLS

### Prerequisites

1. **Route 53 Hosted Zone** for domain
2. **ACM Certificate** in `us-east-1` (required for CloudFront)
3. DNS validation via Route 53

### ACM Certificate Request

```bash
# Request certificate in us-east-1
aws acm request-certificate \
  --region us-east-1 \
  --domain-name images.example.com \
  --validation-method DNS \
  --subject-alternative-names "*.images.example.com"
```

### CloudFront Configuration Update

```yaml
CloudFrontDistribution:
  Properties:
    DistributionConfig:
      Aliases:
        - images.example.com
      ViewerCertificate:
        AcmCertificateArn: arn:aws:acm:us-east-1:123456789012:certificate/abcd1234
        SslSupportMethod: sni-only
        MinimumProtocolVersion: TLSv1.2_2021  # or TLSv1.3_2025
        CertificateSource: acm
```

### DNS Configuration

```yaml
# Route 53 Record Set
DNSRecord:
  Type: AWS::Route53::RecordSet
  Properties:
    HostedZoneId: Z1234567890ABC
    Name: images.example.com
    Type: A
    AliasTarget:
      DNSName: !GetAtt CloudFrontDistribution.DomainName
      EvaluateTargetHealth: false
      HostedZoneId: Z2FDTNDATAQYW2  # CloudFront hosted zone ID
```

### 2025 TLS Updates

- **TLS 1.3 Support:** Automatic for origin connections (S3)
- **Post-Quantum Security Policy:** New `TLSv1.3_2025` policy available (Sept 2025)
- **Recommended:** `TLSv1.2_2021` or `TLSv1.3_2025` for viewer connections

## 5. Signed URLs/Cookies for Private Content

### Use Cases

- Private user-uploaded images
- Premium/restricted content
- Time-limited access
- IP-restricted access

### Setup Requirements

**S3 Configuration:**
- Block all public access
- Bucket policy allows only CloudFront OAC

**CloudFront Distribution:**
- Trusted Key Groups (contains public keys)
- Restrict Viewer Access: `yes`

### Key Pair Generation (ECDSA - 2025 Update)

```bash
# Generate ECDSA key pair (recommended for 2025)
openssl ecparam -name prime256v1 -genkey -noout -out private_key.pem
openssl ec -in private_key.pem -pubout -out public_key.pem
```

**2025 Enhancement:** ECDSA support (Sept 9, 2025)
- Smaller signature size = shorter URLs
- Faster signature generation/verification
- Same security with smaller keys
- Better for mobile/IoT applications

### CloudFront Trusted Key Group

```bash
# Create key group
aws cloudfront create-key-group \
  --key-group-config Name=ImageSigners,Items=["public_key_id"]

# Note: Upload public key via AWS console or API first
```

### Generating Signed URLs (Python Example)

```python
import boto3
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from botocore.signers import CloudFrontSigner

def rsa_signer(message):
    with open('private_key.pem', 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())

def generate_signed_url(url, expiration_time):
    cloudfront_signer = CloudFrontSigner(
        key_id='KEY_GROUP_ID',
        rsa_signer=rsa_signer
    )
    return cloudfront_signer.generate_presigned_url(
        url=url,
        date_less_than=expiration_time
    )

# Usage
signed_url = generate_signed_url(
    'https://images.example.com/private/photo.jpg',
    datetime.datetime(2025, 12, 31)
)
```

### Signed Cookies Alternative

For multiple resources, use signed cookies instead of URLs:

```python
def generate_signed_cookies(domain, expiration_time):
    cloudfront_signer = CloudFrontSigner(
        key_id='KEY_GROUP_ID',
        rsa_signer=rsa_signer
    )
    return cloudfront_signer.generate_presigned_url(
        url=f'https://{domain}/*',
        date_less_than=expiration_time,
        policy='custom-policy'
    )
```

## 6. Price Optimization: CloudFront vs Direct S3

### Cost Comparison (2025 Rates)

| Component | S3 Direct | CloudFront | Savings |
|-----------|-----------|------------|---------|
| Data Transfer (first 10TB) | $0.090/GB | $0.085/GB | 5-15% |
| Requests (GET) | $0.0004/1K | $0.0075/10K | Context dependent |
| Performance | Baseline | 2-3x faster (same region) | N/A |
| Performance | Baseline | 15-20x faster (cross-region) | N/A |

**Break-Even Point:** ~100 GB/month data transfer

### 2025 Flat-Rate Pricing Plans

**New CloudFront Bundled Pricing:**

| Plan | Monthly Cost | Data Transfer | Requests | Includes |
|------|--------------|---------------|----------|----------|
| Free | $0 | 1 TB | 10M | Basic features |
| Pro | $15 | 2 TB | 25M | WAF, Shield, Route 53 |
| Business | $200 | 15 TB | 150M | All + Lambda@Edge credits |
| Premium | $1000 | 50 TB | 500M | Maximum allowances |

**Benefits:**
- Predictable monthly costs
- No overage charges
- Includes S3 storage credits
- DDoS protection included

### Cost Optimization Strategies

1. **Use Price Classes**
   - `PriceClass_100`: US/Canada/Europe (cheapest)
   - `PriceClass_200`: + Asia/Middle East
   - `PriceClass_All`: All locations (most expensive)

2. **Optimize Images**
   - Convert to WebP/AVIF (20-50% size reduction)
   - Implement responsive images
   - Lazy loading in applications

3. **Maximize Cache Hit Ratio**
   - Target: 80%+ cache hit rate
   - Use versioning for immutable assets
   - Set appropriate TTLs

4. **S3 Storage Classes**
   - Standard: Frequent access
   - Standard-IA: Infrequent access (<30% cost savings)
   - Glacier: Archive (rarely accessed images)

5. **Lifecycle Policies**
   - Transition old images to Standard-IA after 30 days
   - Delete thumbnails after 90 days (regenerate on demand)

## 7. Best Practices for Image Delivery Performance

### Performance Optimization

1. **HTTP/3 Enabled**
   - Faster connection establishment
   - Better performance on unreliable networks
   - Reduced latency

2. **Image Format Optimization**
   - Serve WebP/AVIF when supported
   - Fallback to JPEG/PNG
   - Use CloudFront Functions for format selection

3. **Compression**
   - Enable Gzip + Brotli (automatic for text)
   - Images already compressed (no additional benefit)

4. **Origin Shield**
   - Reduces origin load
   - Improves cache hit ratio
   - Best for high-traffic scenarios

5. **Regional Edge Caches**
   - Automatic with CloudFront
   - Intermediate caching layer
   - Reduces origin fetches

### Security Best Practices

1. **OAC Over OAI**
   - Modern security model
   - SigV4 authentication
   - Enhanced security controls

2. **HTTPS Everywhere**
   - Redirect HTTP to HTTPS
   - TLS 1.2 minimum
   - TLS 1.3 recommended

3. **WAF Integration**
   - SQL injection protection
   - Rate limiting
   - Bot mitigation

4. **Shield Standard**
   - DDoS protection (automatic, free)
   - Shield Advanced for critical workloads

### Monitoring & Analytics

1. **CloudWatch Metrics**
   - Requests
   - Bytes downloaded
   - 4xx/5xx error rates
   - Cache hit ratio

2. **CloudFront Reports**
   - Popular objects
   - Usage by region
   - Top referrers

3. **Real-Time Logs**
   - S3 logging destination
   - Kinesis Firehose for streaming
   - Analyze with Athena/QuickSight

## Summary Checklist

**Setup:**
- [ ] Create private S3 bucket
- [ ] Enable OAC (not OAI)
- [ ] Create CloudFront distribution
- [ ] Configure cache policy
- [ ] Set up ACM certificate (us-east-1)
- [ ] Configure Route 53 alias
- [ ] Enable HTTPS redirect

**Optimization:**
- [ ] Use versioned filenames
- [ ] Set long TTLs (1 year)
- [ ] Enable HTTP/2 and HTTP/3
- [ ] Enable compression
- [ ] Select appropriate price class
- [ ] Implement image optimization pipeline

**Security:**
- [ ] Block public S3 access
- [ ] Enable OAC
- [ ] Enforce HTTPS
- [ ] Add WAF rules (if needed)
- [ ] Configure Shield Standard

**Cost Management:**
- [ ] Monitor cache hit ratio
- [ ] Use appropriate price class
- [ ] Consider flat-rate pricing plans
- [ ] Implement lifecycle policies
- [ ] Optimize image sizes

## Unresolved Questions

None - all research topics covered comprehensively.

## Sources

- AWS CloudFront Developer Guide: /websites/aws_amazon_amazoncloudfront_developerguide
- AWS CloudFormation Template Reference: /websites/aws_amazon_awscloudformation_templatereference
- Terraform AWS Provider: /hashicorp/terraform-provider-aws
- AWS CloudFront TLS 1.3 Announcement (2025)
- AWS CloudFront Post-Quantum Security Policy (2025)
- AWS CloudFront ECDSA Support (2025)
- AWS CloudFront Flat-Rate Pricing (2025)
