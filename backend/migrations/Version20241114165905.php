<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241114165905 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE report_user (report_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_FEBF3BB24BD2A4C0 (report_id), INDEX IDX_FEBF3BB2A76ED395 (user_id), PRIMARY KEY(report_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE report_user ADD CONSTRAINT FK_FEBF3BB24BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report_user ADD CONSTRAINT FK_FEBF3BB2A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report ADD review_action VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report_user DROP FOREIGN KEY FK_FEBF3BB24BD2A4C0');
        $this->addSql('ALTER TABLE report_user DROP FOREIGN KEY FK_FEBF3BB2A76ED395');
        $this->addSql('DROP TABLE report_user');
        $this->addSql('ALTER TABLE report DROP review_action');
    }
}
