# Phase 1: AWS Infrastructure Setup

**Status**: `pending`
**Duration**: 3 hours
**Dependencies**: None

---

## Objectives

Set up AWS infrastructure (S3 + CloudFront) with proper security, OAC configuration, and custom domain support.

---

## Prerequisites

- AWS account with admin access
- Route 53 hosted zone (if using custom domain)
- AWS CLI configured locally
- Terraform or CloudFormation installed

---

## Tasks

### 1.1 Create S3 Bucket (30 min)

**Configuration**:
- Bucket name: `dynamite-notes-images`
- Region: `ap-southeast-1` (Singapore)
- Block all public access: **ENABLED**
- Versioning: **DISABLED** (save costs)
- Default encryption: **AES256**
- Object lock: **DISABLED**

**Commands**:
```bash
# Create bucket
aws s3api create-bucket \
  --bucket dynamite-notes-images \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Block public access
aws s3api put-public-access-block \
  --bucket dynamite-notes-images \
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket dynamite-notes-images \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

---

### 1.2 Create CloudFront OAC (30 min)

**Configuration**:
- Name: `dynamite-notes-images-oac`
- Origin type: S3
- Signing behavior: `always`
- Signing protocol: `sigv4`

**CloudFormation**:
```yaml
OriginAccessControl:
  Type: AWS::CloudFront::OriginAccessControl
  Properties:
    OriginAccessControlConfig:
      Name: dynamite-notes-images-oac
      OriginAccessControlOriginType: s3
      SigningBehavior: always
      SigningProtocol: sigv4
```

---

### 1.3 Create CloudFront Distribution (60 min)

**Configuration**:
- Origin: S3 bucket (regional endpoint)
- OAC: Link to OAC created above
- Viewer protocol: `redirect-to-https`
- HTTP version: `http2and3`
- Cache policy: `CachingOptimized` (managed)
- Origin request policy: `CORS-S3Origin` (managed)
- Price class: `PriceClass_200` (Asia-Pacific primary)

**CloudFormation**:
```yaml
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
        AllowedMethods: [GET, HEAD, OPTIONS]
        CachedMethods: [GET, HEAD]
        CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
        OriginRequestPolicyId: 88a5eaf4-2fd4-4709-b370-b4c650ea3fcf
        Compress: true
      PriceClass: PriceClass_200
```

---

### 1.4 Configure Bucket Policy (20 min)

**Policy**: Allow only CloudFront OAC access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dynamite-notes-images/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1234ABCD"
        }
      }
    }
  ]
}
```

**Apply**:
```bash
aws s3api put-bucket-policy \
  --bucket dynamite-notes-images \
  --policy file://bucket-policy.json
```

---

### 1.5 Configure CORS (20 min)

**CORS Rules**:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedOrigins": ["https://dynamite.vn", "http://localhost:5173"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Apply**:
```bash
aws s3api put-bucket-cors \
  --bucket dynamite-notes-images \
  --cors-configuration file://cors-config.json
```

---

### 1.6 Setup Custom Domain (Optional - 30 min)

**Prerequisites**:
- Route 53 hosted zone for `dynamite.vn`
- ACM certificate in `us-east-1`

**Steps**:
1. Request ACM certificate for `images.dynamite.vn`
2. Validate via DNS
3. Add alternate domain to CloudFront
4. Create Route 53 alias record

**Route 53 Record**:
```yaml
DNSRecord:
  Type: AWS::Route53::RecordSet
  Properties:
    HostedZoneId: Z1234567890ABC
    Name: images.dynamite.vn
    Type: A
    AliasTarget:
      DNSName: !GetAtt CloudFrontDistribution.DomainName
      EvaluateTargetHealth: false
      HostedZoneId: Z2FDTNDATAQYW2
```

---

## Verification Checklist

- [ ] S3 bucket created in `ap-southeast-1`
- [ ] Public access blocked on bucket
- [ ] Default encryption enabled (AES256)
- [ ] OAC created successfully
- [ ] CloudFront distribution deployed
- [ ] Distribution status: `Deployed`
- [ ] Bucket policy allows only CloudFront OAC
- [ ] CORS rules configured
- [ ] Direct S3 access denied (test via browser)
- [ ] CloudFront URL accessible (test upload)
- [ ] HTTPS enforced
- [ ] Custom domain resolves (if configured)

---

## Testing

```bash
# Test 1: Verify S3 access blocked (should fail)
aws s3 ls s3://dynamite-notes-images --no-sign-request
# Expected: AccessDenied

# Test 2: Upload test object via presigned URL
# (Generate presigned URL and test via curl)

# Test 3: Access via CloudFront (should succeed)
curl -I https://d1abc123.cloudfront.net/test-image.jpg
# Expected: 200 OK with Cache-Control headers

# Test 4: Verify HTTPS redirect
curl -I http://images.dynamite.vn/test.jpg
# Expected: 301 Moved Permanently → HTTPS
```

---

## Rollback Plan

```bash
# Delete CloudFront distribution (must disable first)
aws cloudfront delete-distribution --id E1234ABCD

# Delete S3 bucket (must empty first)
aws s3 rm s3://dynamite-notes-images --recursive
aws s3api delete-bucket --bucket dynamite-notes-images

# Delete OAC
aws cloudfront delete-origin-access-control --id EABC123
```

---

## Outputs

**After completion, document**:
- S3 bucket ARN
- CloudFront distribution ID
- CloudFront domain name
- Custom domain URL (if applicable)
- OAC ID

**Save to**: `/infrastructure/outputs.txt`

---

## Next Phase

Once infrastructure is verified, proceed to **Phase 2: Database Schema Migration**.
